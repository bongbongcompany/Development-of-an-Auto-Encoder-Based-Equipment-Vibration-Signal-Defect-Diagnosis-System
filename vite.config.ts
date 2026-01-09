import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const APP_PORT = Number(process.env.VITE_APP_PORT || 5005);

  // Node(Express) - 로그인/기타 API
  const NODE_API = process.env.VITE_NODE_PROXY || "http://127.0.0.1:3001";
  // FastAPI - AI 업로드/추론
  const AI_API = process.env.VITE_AI_PROXY || "http://127.0.0.1:8000";

  return defineConfig({
    plugins: [
      tsconfigPaths(),
      react(),
      checker({
        typescript: true,
        eslint: {
          useFlatConfig: true,
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
        },
        overlay: { initialIsOpen: false },
      }),
    ],
    preview: { port: APP_PORT },
    server: {
      port: APP_PORT,
      strictPort: true,
      proxy: {
        // 기존 Node 서버 API는 그대로 /api
        "/api": {
          target: NODE_API,
          changeOrigin: true,
          secure: false,
          // Node는 이미 /api/auth 같은 prefix를 쓰니까 보통 rewrite 안 함
        },

        // FastAPI 서버: 파일 업로드 및 AI 추론
        // 프론트에서 fetch("/ai/upload") 호출 시 -> FastAPI의 /upload로 전달
        "/ai": {
          target: AI_API,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/ai/, ""),
        },
      },
    },
    base: process.env.NODE_ENV === "production" ? process.env.VITE_BASENAME : "/",
  });
};
