import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import {
  generateAatPpt,
  generateAatAssignment,
  generateProjectReport,
  generateCaseStudy,
  regenerateSection,
} from './src/server/geminiService';

dotenv.config();

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/health' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              status: 'ok',
              hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
              timestamp: new Date().toISOString(),
            })
          );
          return;
        }

        if (req.url === '/api/generate' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { action, payload } = JSON.parse(body || '{}');
              let result;

              switch (action) {
                case 'aat_ppt':
                  result = await generateAatPpt(payload);
                  break;
                case 'aat_assignment':
                  result = await generateAatAssignment(payload);
                  break;
                case 'project_report':
                  result = await generateProjectReport(payload);
                  break;
                case 'case_study':
                  result = await generateCaseStudy(payload);
                  break;
                case 'regenerate_section':
                  result = await regenerateSection(payload);
                  break;
                default:
                  throw new Error(`Unsupported academic generation action: ${action}`);
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, data: result }));
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : String(err);
              console.error('API Error in /api/generate:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
