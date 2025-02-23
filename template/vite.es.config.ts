import { rollup, watch, RollupOptions, OutputOptions } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { jsxInclude, jsxBin, jsxPonyfill } from 'vite-cep-plugin';
import path from 'path';
import json from '@rollup/plugin-json';
import {
    jsonParsePonyfill,
    jsonStringifyPonyfill
} from './ponyfills/json2-ponyfill';
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
        // treeshake: true,
        output: {
            file: outPath,
            sourcemap: true,
            // format: 'iife',
            exports: 'none'
        },
        external: ['json2'],
        plugins: [
            json(),
            nodeResolve({
                extensions
            }),
            babel({
                extensions,
                exclude: /node_modules/,
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
            jsxBin('off')
        ]
    };

    async function build() {
        const bundle = await rollup(config);
        await bundle.write(config.output as OutputOptions);
        await bundle.close();
    }

    // const watchRollup = async () => {
    //   const watcher = watch(config);
    //   watcher.on('event', ({ result }: any) => {
    //     if (result) {
    //       result.close();
    //     }
    //   });
    //   watcher.close();
    // };

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
