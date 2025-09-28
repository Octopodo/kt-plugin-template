#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const adobeAppsMap = {
    AfterEffects: 'ae',
    ExtendScript: 'es',
    Photoshop: 'ps',
    Premiere: 'pr',
    Illustrator: 'ai'
}
async function createPlugin() {
    // Pregunta al usuario
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'pluginName',
            message: '¿Wich is the name of your plugin?',
            default: 'MyPlugin',
            validate: (input) =>
                /^[a-zA-Z0-9-]+$/.test(input) ||
                'Only letters, numbers and hyphens are allowed'
        },
        {
            type: 'list',
            name: 'targetProgram',
            message: '¿Wich is the target program?',
            choices: [
                'AfterEffects',
                'ExtendScript',
                'Photoshop',
                'Premiere',
                'Illustrator'
            ],
            default: 'AfterEffects'
        },
        {
            type: 'list',
            name: 'appVersion',
            message: '¿Wich is the target app version?',
            when: (answers) => answers.targetProgram !== 'ExtendScript',
            choices: async (answers) => {
                const versions = await getAppAvailableVersions(
                    answers.targetProgram
                );
                return versions;
            },
            default: '23.0'
        },
        // Install testing framework?
        {
            type: 'confirm',
            name: 'installTestingFramework',
            message: '¿Install testing framework?',
            default: true
        },
        {
            type: 'input',
            name: 'author',
            message: '¿Author?',
            default: ''
        },
        {
            type: 'input',
            name: 'description',
            message: '¿Description?',
            default: ''
        },
        {
            type: 'confirm',
            name: 'installDeps',
            message: '¿Install dependencies?',
            default: true
        }
    ]);

    const { pluginName, targetProgram, installDeps, appVersion } = answers;
    const sourceDir = path.join(__dirname, '../template');
    const targetDir = path.resolve(process.cwd(), pluginName);
    const ktDependencies: string[] = ['kt-core'];
    const devDependencies: string[] = [];
    if (answers.installTestingFramework) {
        const testingDep = getTestingDependency(targetProgram);
        devDependencies.push(testingDep);
    }

    try {
        // Copia la carpeta template
        await fs.mkdir(targetDir, { recursive: true });
        await copyDir(
            sourceDir,
            targetDir,
            pluginName,
            answers.author,
            answers.description,
            ktDependencies,
            devDependencies,
            targetProgram,
            appVersion
        );

        console.log(`Project "${pluginName}" created at ${targetDir}`);
        // Si se seleccionó, añade dependencias de testing
    
        // Instala dependencias si se seleccionó
        if (installDeps) {
            console.log('Installing dependencias...');
            await execAsync('npm install', { cwd: targetDir });
            console.log('Dependencias instaladas');
        } else {
            console.log(
                'Type "cd ' +
                    pluginName +
                    ' && npm install" to install dependencies'
            );
        }
    } catch (err) {
        console.error('Error building the project:', err);
    }
}

async function copyDir(
    src: string,
    dest: string,
    pluginName: string,
    author: string = '',
    description: string = '',
    ktDependencies: string[] = [],
    devDependencies: string[] = [],
    targetProgram: string,
    appVersion: string,

) {
    const entries = await fs.readdir(src, { withFileTypes: true });
    const kebapName = toKebabCase(pluginName);
    const upperCamelName = toUpperCamelCase(pluginName);
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const newName = entry.name.replace('MyPlugin', upperCamelName);
        const destPath = path.join(dest, newName);
        const name = entry.name;
        if (entry.isDirectory()) {
            await fs.mkdir(destPath, { recursive: true });
            await copyDir(
                srcPath,
                destPath,
                pluginName,
                author,
                description,
                ktDependencies,
                devDependencies,
                targetProgram,
                appVersion
            );
        } else {
            const content = await fs.readFile(srcPath, 'utf-8');
            let newContent = content;
            if (entry.name === 'package.json') {
                newContent = await modifyPackageJson(
                    newContent,
                    kebapName,
                    author,
                    description,
                    ktDependencies,
                    devDependencies
                );
            } else if (
                entry.name === 'tsconfig.json' &&
                targetProgram !== 'ExtendScript'
            ) {
                newContent = addAppTypesToTsConfig(
                    newContent,
                    targetProgram,
                    appVersion
                );
            } else {
                newContent = newContent.replace(/MyPlugin/g, upperCamelName);
            }
            await fs.writeFile(destPath, newContent);
        }
    }
}

function toCamelCase(str: string) {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toUpperCamelCase(str: string) {
    return toCamelCase(str).replace(/^[a-z]/, (letter) => letter.toUpperCase());
}

function toKebabCase(str: string) {
    return str.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
}

async function modifyPackageJson(
    content: string,
    name: string,
    author: string = '',
    description: string = '',
    ktDependencies: string[] = [],
    ktDevDependencies: string[] = []
) {
    const config = JSON.parse(content);
    config.dependencies = config.dependencies || {};
    config.devDependencies = config.devDependencies || {};
    ktDependencies.forEach((dep) => {
        config.dependencies[dep] = '*';
    });
    ktDevDependencies.forEach((dep) => {
        config.devDependencies[dep] = '*';
    });
    config.name = name;
    config.author = author;
    config.description = description;
    config.version = '1.0.0';
    const newContent = JSON.stringify(config, null, 2);
    return newContent;
}

// function modifyViteConfig(content: string, ktDependencies: string[] = []) {
//     //modify "exclude: /node_modules/" to include kt dependencies"
//     const newContent = content.replace(
//         /exclude: \/node_modules\//,
//         `exclude: /node_modules\\/(?!${ktDependencies.join('|')})/`
//     );
//     return newContent;
// }

async function getAppAvailableVersions(app: string) {
    const typesForAdobePath = path.dirname(
        require.resolve('types-for-adobe/package.json')
    );
    const appPath = path.join(typesForAdobePath, app);
    console.log('Finding verions:', appPath);
    try {
        const appDir = await fs.readdir(appPath, { withFileTypes: true });
        if (!appDir || appDir.length === 0) {
            throw new Error(`App ${app} not found or empty`);
        }
        const versions = appDir
            .filter((dir) => dir.isDirectory())
            .map((dir) => dir.name);
        return versions;
    } catch (err) {
        console.error('Error al leer versiones:', err);
        return ['Unknown'];
    }
}

function addAppTypesToTsConfig(content: string, app: string, version: string) {
    const appPath = `./node_modules/types-for-adobe/${app}/${version}`;
    const tsconfig = JSON.parse(content);
    tsconfig.compilerOptions = tsconfig.compilerOptions || {};
    tsconfig.compilerOptions.types = tsconfig.compilerOptions.types || [];
    let alreadyAdded = false;
    for (const type of tsconfig.compilerOptions.types) {
        if (type === appPath) {
            alreadyAdded = true;
            break;
        }
    }
    if (!alreadyAdded) {
        tsconfig.compilerOptions.types.push(appPath);
    }
    return JSON.stringify(tsconfig, null, 2);
}

function getTestingDependency(targetProgram: string) {
    return `kt-testing-suite-${adobeAppsMap[targetProgram as keyof typeof adobeAppsMap] || 'es'}`;
}

createPlugin();
