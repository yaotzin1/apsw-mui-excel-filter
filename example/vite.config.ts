import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// The example reads the component straight out of ../src, so editing the component shows
// up here on save without a build step. An app installing from npm needs none of this:
// `npm install apsw-mui-excel-filter` and the bare import resolves on its own.
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            'apsw-mui-excel-filter': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
        },
        // The aliased source sits outside this folder, so its own imports would otherwise
        // resolve against the repository's node_modules and hand the page a second React
        // and a second emotion cache. That breaks hooks and theming respectively, which is
        // an artefact of reading the component out of ../src and not something an app
        // installing from npm has to think about.
        dedupe: [
            'react',
            'react-dom',
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
        ],
    },
});
