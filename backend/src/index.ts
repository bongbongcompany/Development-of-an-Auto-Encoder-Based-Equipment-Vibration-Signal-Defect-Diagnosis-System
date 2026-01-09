//backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { connectDB } from './db';
import { authRouter } from './routes/auth';
import { chatRouter } from './routes/chat'; // ✅ 추가

dotenv.config();

const app = express();

app.set('trust proxy', 1);
app.use(cors());

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

/**
 * ✅ AI(FastAPI) 프록시
 * - multipart 업로드가 깨지지 않게 express.json()보다 먼저 둔다
 */
app.use(
  ['/upload', '/docs', '/openapi.json', '/redoc'],
  createProxyMiddleware({
    target: FASTAPI_URL,
    changeOrigin: true,
    logLevel: 'warn',
    proxyTimeout: 120_000,
    timeout: 120_000,
    onError(err, _req, res) {
      console.error('[AI proxy] error:', err);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `AI proxy error: ${err.message}` }));
    },
  }),
);

// ✅ fetch-db는 FastAPI가 /api/fetch-db 로 가지고 있으니 rewrite
app.use(
  '/fetch-db',
  createProxyMiddleware({
    target: FASTAPI_URL,
    changeOrigin: true,
    pathRewrite: { '^/fetch-db': '/api/fetch-db' },
    logLevel: 'warn',
    proxyTimeout: 120_000,
    timeout: 120_000,
    onError(err, _req, res) {
      console.error('[AI proxy] error:', err);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `AI proxy error: ${err.message}` }));
    },
  }),
);

// (선택) FastAPI health도 보고 싶으면
app.use(
  '/ai/health',
  createProxyMiddleware({
    target: FASTAPI_URL,
    changeOrigin: true,
    pathRewrite: { '^/ai/health': '/health' },
    logLevel: 'warn',
  }),
);

// 여기부터 기존 Node API
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true, server: 'node' }));

app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter); // ✅ 추가

const PORT = Number(process.env.PORT || 3001);

async function bootstrap() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`API server listening on http://localhost:${PORT}`);
      console.log(`Proxying AI(FastAPI) to: ${FASTAPI_URL}`);
    });
  } catch (e) {
    console.error('Failed to start server:', e);
    process.exit(1);
  }
}

bootstrap();
