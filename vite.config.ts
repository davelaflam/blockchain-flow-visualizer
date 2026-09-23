import { defineConfig, loadEnv, Plugin, ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  // Server-side env — loads ALL .env vars including non-VITE_ ones. API keys
  // live here and are injected into proxied requests below, so they never
  // reach the browser bundle.
  const serverEnv = loadEnv(mode, process.cwd(), '');

  const aiProxy: Record<string, ProxyOptions> = {
    '/api/openai': {
      target: 'https://api.openai.com',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/api\/openai/, '/v1'),
      configure: proxy => {
        proxy.on('proxyReq', proxyReq => {
          if (serverEnv.OPENAI_API_KEY) {
            proxyReq.setHeader('Authorization', `Bearer ${serverEnv.OPENAI_API_KEY}`);
          }
        });
      },
    },
    '/api/anthropic': {
      target: 'https://api.anthropic.com',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/api\/anthropic/, '/v1'),
      configure: proxy => {
        proxy.on('proxyReq', proxyReq => {
          if (serverEnv.CLAUDE_API_KEY) {
            proxyReq.setHeader('x-api-key', serverEnv.CLAUDE_API_KEY);
          }
          proxyReq.setHeader('anthropic-version', '2023-06-01');
        });
      },
    },
    '/api/gemini': {
      target: 'https://generativelanguage.googleapis.com',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/api\/gemini/, '/v1beta'),
      configure: proxy => {
        proxy.on('proxyReq', proxyReq => {
          if (serverEnv.GEMINI_API_KEY) {
            proxyReq.setHeader('x-goog-api-key', serverEnv.GEMINI_API_KEY);
          }
        });
      },
    },
  };

  // Reports which providers have a server-side key configured without
  // exposing the keys themselves. Used by the client to enable/disable
  // providers in the UI.
  const aiConfigPlugin = (): Plugin => {
    const handler = (_req: unknown, res: { setHeader: (k: string, v: string) => void; end: (b: string) => void }) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          openai: !!serverEnv.OPENAI_API_KEY,
          gemini: !!serverEnv.GEMINI_API_KEY,
          claude: !!serverEnv.CLAUDE_API_KEY,
        })
      );
    };
    return {
      name: 'ai-config',
      configureServer: server => {
        server.middlewares.use('/api/ai-config', handler);
      },
      configurePreviewServer: server => {
        server.middlewares.use('/api/ai-config', handler);
      },
    };
  };

  return {
    plugins: [react(), tsconfigPaths(), aiConfigPlugin()],
    resolve: {
      alias: {
        // Add any additional aliases if needed
        // This is already handled by vite-tsconfig-paths based on tsconfig.json
      },
    },
    publicDir: 'public',
    server: {
      port: 5173,
      proxy: aiProxy,
    },
    preview: {
      proxy: aiProxy,
    },
    build: {
      outDir: 'build', // Same output directory as CRA
      sourcemap: true,
    },
  };
});
