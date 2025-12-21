import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
	build: {
		lib: {
			entry: path.resolve(__dirname, 'backend/main.ts'),
			formats: ['cjs'],
			fileName: () => 'main.js',
		},
		outDir: 'dist/backend',
		emptyOutDir: true,
		sourcemap: true,
		rollupOptions: {
			external: ['electron', 'electron-store', 'node:path', 'node:fs', 'node:os', 'node:child_process'],
		},
		target: 'node20',
		minify: false,
	},
});
