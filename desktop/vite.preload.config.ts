import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'backend/preload.ts'),
      formats: ['cjs'],
      fileName: () => 'preload.js',
    },
    outDir: 'dist/backend',
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      external: ['electron'],
    },
    target: 'node20',
    minify: false,
  },
})
