import { defineConfig } from 'vite';
import { extendscriptConfig } from './vite.es.config';
import path from 'path';
const extensions = ['.js', '.ts', '.tsx'];
const outPathExtendscript = path.join('dist', 'index.js');

const input = path.resolve(__dirname, 'src/index.ts');

export default defineConfig({
    build: {
        minify: false,
        rollupOptions: {
            input,
            output: {
                entryFileNames: 'index.js',
                dir: 'dist'
            },
            external: ['json2'],
            plugins: [
                {
                    name: 'json2',
                    resolveId(id) {
                        if (id === 'json2') {
                            return path.resolve(__dirname, 'src/libs/json2.js');
                        }
                        return null;
                    }
                }
            ]
        }
    }
});

extendscriptConfig(`src/index.ts`, outPathExtendscript, extensions, false);
