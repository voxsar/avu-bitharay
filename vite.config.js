import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	root: '.',
	publicDir: 'public',
	build: {
		outDir: 'dist',
		assetsDir: 'assets',
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				leaderboard: resolve(__dirname, 'leaderboard.html'),
			},
		},
	},
});
