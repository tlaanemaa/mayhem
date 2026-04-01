import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: dirname,
  build: {
    outDir: path.join(dirname, 'dist'),
    emptyOutDir: true,
  },
});
