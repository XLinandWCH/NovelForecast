import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api/rag': {
          target: 'http://127.0.0.1:18181',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/rag/, ''),
          router: (req) => {
            const targetUrl = req.headers['x-rag-target'];
            if (targetUrl && typeof targetUrl === 'string') {
              return targetUrl;
            }
          },
          bypass: (req, res, options) => {
            if (req.method === 'OPTIONS') {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-rag-target');
              res.statusCode = 204;
              res.end();
              return false;
            }
          }
        },
        '/api/ai': {
          target: 'http://127.0.0.1:11434',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/ai/, ''),
          router: (req) => {
            const targetUrl = req.headers['x-ai-target'];
            if (targetUrl && typeof targetUrl === 'string') {
              return targetUrl;
            }
          },
          bypass: (req, res, options) => {
            if (req.method === 'OPTIONS') {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-ai-target');
              res.statusCode = 204;
              res.end();
              return false;
            }
          }
        }
      }
    },
  };
});
