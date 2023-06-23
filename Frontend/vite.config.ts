import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

//Vite API : https://vitejs.dev/guide/backend-integration.html 
export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
		  allow: ['src']
		}
	  },
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
