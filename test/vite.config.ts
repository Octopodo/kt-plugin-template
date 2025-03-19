import { build, defineConfig } from 'vite';
import { extendscriptConfig } from './vite.es.config';
import path from 'path';
import commandLineArgs from 'command-line-args';

const optionsDefinitions = [
    // { name: 'build', type: String },
    { name: 'watch', type: Boolean },
    { name: 'mode', alias: 'm', type: String }
];
const args = process.argv.slice(2);
const options = commandLineArgs(optionsDefinitions, {
    argv: args,
    partial: true
});
// console.log(options);
const extensions = ['.js', '.ts', '.tsx'];
const outPathExtendscript = path.join('dist', 'index.js');
const input = path.resolve(__dirname, 'src/index.ts');

console.log(args);

export default defineConfig({
    build: {
        minify: false,
        rollupOptions: {
            input,
            output: {
                entryFileNames: 'index.js',
                dir: 'dist'
            }
        }
    }
});

const mode = options.mode === 'production';
extendscriptConfig(`src/index.ts`, outPathExtendscript, extensions, mode);
