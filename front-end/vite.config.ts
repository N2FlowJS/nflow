import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: mode === 'production' ? '/nflow/' : '/',
      root: '.',
      publicDir: 'public',
      server: {
        port: 4664,
        host: '0.0.0.0',
        strictPort: false,
        proxy: {
          '/api': {
            target: 'http://localhost:8787',
            changeOrigin: true,
            rewrite: (path) => path
          }
        }
      },
      build: {
        outDir: 'dist',
        sourcemap: true,
        minify: 'terser'
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      worker: {
        format: 'es',
      },
      resolve: {
        alias: {
          '@': path.resolve(process.cwd(), '.')
        }
      }
    };
});
