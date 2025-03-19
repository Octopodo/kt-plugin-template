import { rollup, watch, RollupOptions, OutputOptions } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { jsxInclude, jsxBin, jsxPonyfill } from 'vite-cep-plugin';
import path from 'path';
import json from '@rollup/plugin-json';
const GLOBAL_THIS = 'thisObj';

export const extendscriptConfig = (
    extendscriptEntry: string,
    outPath: string,
    extensions: string[],
    isProduction: boolean
) => {
    console.log(outPath);
    const config: RollupOptions = {
        input: extendscriptEntry,
        treeshake: false,
        output: {
            file: outPath,
            sourcemap: true,
            // format: 'iife',
            exports: 'auto'
        },
        external: ['json2'],
        plugins: [
            json(),
            nodeResolve({
                extensions
            }),
            babel({
                extensions,
                exclude: /node_modules\/(?!kt-core)/,
                babelrc: false,
                babelHelpers: 'inline',
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            targets: {
                                esmodules: 'commonjs',
                                ie: '9'
                            }
                        }
                    ],
                    '@babel/preset-typescript'
                ],
                plugins: [
                    '@babel/plugin-proposal-class-properties',
                    '@babel/plugin-syntax-dynamic-import',
                    ['@babel/plugin-transform-classes', { loose: true }]
                ]
            }),
            jsxPonyfill(),
            jsxInclude({
                iife: true,
                globalThis: GLOBAL_THIS
            }),
            jsxBin('off'),
            {
                // Plugin personalizado sin MagicString
                name: 'remove-exports',
                transform(code, id) {
                    if (id.endsWith('index.ts')) {
                        // Elimina exportaciones como 'export { KT }'
                        const modifiedCode = code.replace(
                            /(^|\n)\s*export\s+(default\s+)?({[^}]+}|\w+\s*(=|\([^)]*\))?.*?(;|\n|$)|class\s+\w+\s*{[\s\S]*?}|\s*function\s+\w+\s*\([^)]*\)\s*{[\s\S]*?})/g,
                            '$1' // Conserva el salto de línea inicial, elimina la exportación
                        );
                        return {
                            code: modifiedCode,
                            map: null // Sin mapa de origen por simplicidad
                        };
                    }
                    return null; // No transforma otros archivos
                }
            }
        ]
    };

    async function build() {
        const bundle = await rollup(config);
        await bundle.write(config.output as OutputOptions);
        await bundle.close();
    }

    function watchRollup() {
        const watcher = watch(config);
        watcher.on('event', (event) => {
            switch (event.code) {
                case 'START':
                    console.log('Watcher iniciado...');
                    break;
                case 'BUNDLE_START':
                    console.log('Reconstruyendo...');
                    break;
                case 'BUNDLE_END':
                    event.result
                        .write(config.output as OutputOptions)
                        .then(() => {
                            console.log('Archivo actualizado:', outPath);
                            event.result.close(); // Cierra el bundle después de escribir
                        });
                    break;
                case 'END':
                    console.log('Watch ciclo completo');
                    break;
                case 'ERROR':
                    console.error('Error en watch:', event.error);
                    break;
            }
        });
        // No cierres el watcher inmediatamente para que siga escuchando
        // watcher.close(); // Esto estaba cortando el watch
    }

    if (isProduction) {
        build();
    } else {
        watchRollup();
    }
};
