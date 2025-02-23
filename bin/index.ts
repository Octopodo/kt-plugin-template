#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
            type: 'confirm',
            name: 'installKT',
            message: '¿Install KT?',
            default: false
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

    const { pluginName, targetProgram, installDeps, installKT } = answers;
    const sourceDir = path.join(__dirname, '../template');
    const targetDir = path.resolve(process.cwd(), pluginName);
    const ktDependencies = [];
    if (installKT) {
        ktDependencies.push('kt-es-core-ts');
        if (targetProgram === 'AfterEffects') {
            ktDependencies.push('kt-es-ae-ts');
        }
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
            ktDependencies
        );

        console.log(`Project "${pluginName}" created at ${targetDir}`);

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
    ktDependencies: string[] = []
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
            await copyDir(srcPath, destPath, pluginName);
        } else {
            const content = await fs.readFile(srcPath, 'utf-8');
            let newContent = content;
            if (entry.name === 'package.json') {
                newContent = await modifyPackageJson(
                    newContent,
                    kebapName,
                    author,
                    description,
                    ktDependencies
                );
            } else if (entry.name === 'vite.es.config.ts') {
                newContent = modifyViteConfig(newContent, ktDependencies);
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
    ktDependencies: string[] = []
) {
    const config = JSON.parse(content);
    config.dependencies = config.dependencies || {};
    ktDependencies.forEach((dep) => {
        config.dependencies[dep] = '*';
    });
    config.name = name;
    config.author = author;
    config.description = description;
    config.version = '1.0.0';
    const newContent = JSON.stringify(config, null, 2);
    return newContent;
}

function modifyViteConfig(content: string, ktDependencies: string[] = []) {
    //modify "exclude: /node_modules/" to include kt dependencies"
    const newContent = content.replace(
        /exclude: \/node_modules\//,
        `exclude: /node_modules\\/(?!${ktDependencies.join('|')})/`
    );
    return newContent;
}

createPlugin();
