import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      // Add any additional aliases if needed
      // This is already handled by vite-tsconfig-paths based on tsconfig.json
    },
  },
  publicDir: 'public',
  server: {
    port: 5173,
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/anthropic/, ''),
      },
      '/v1/messages': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          // Ensure authentication headers are properly forwarded
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.headers['x-api-key']) {
              proxyReq.setHeader('x-api-key', req.headers['x-api-key']);
            }
            if (req.headers['anthropic-version']) {
              proxyReq.setHeader('anthropic-version', req.headers['anthropic-version']);
            }
          });
        },
      },
    },
  },
  build: {
    outDir: 'build', // Same output directory as CRA
    sourcemap: true,
  },
});
