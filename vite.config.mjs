
// Node.js 및 환경변수 관련
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Vite 관련
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Module Federation 관련
import { federation } from '@module-federation/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async (env, argv) => {

  // 1. 실행 모드
  const mode = env.mode || 'development';
  const isDevelopment = mode === 'development';

  // 2. 환경변수 파일 선택
  const envPath = path.resolve(
    __dirname,
    isDevelopment ? '.env.dev' : '.env'
  );

  // 3. 환경변수 로드
  const result = dotenv.config({
    path: envPath,
    override: true
  });

  if (result.error) {
    throw new Error(
      `[Vite] Environment loading failed: ${envPath}`
    );
  }

  // 4. Federation 설정 로드
  const { default: mf } = await import(
    './federation/federation.config.mjs'
  );

  const { shared, exposes } = mf;

  // 5. 실행 정보
  console.log('[Vite Remote]');
  console.log('mode:', mode);
  console.log('command:', env.command);
  console.log('envPath:', envPath);
  console.log('appName:', mf.name);
  console.log('appPort:', mf.env.appPort);
  console.log('remoteFormat:', mf.env.remoteFormat);
  console.log('exposes:', exposes);

  // 6. Vite 설정
  return {
    root: __dirname,

    base: '/',

    plugins: [
      react(),

      tailwindcss(),

      federation({
        name: mf.name,
        filename: mf.filename,
        exposes,
        shared,
        dts: false
      })
    ],

    server: {
      host: '0.0.0.0',
      port: mf.env.appPort,
      strictPort: true,
      cors: true
    },

    preview: {
      host: '0.0.0.0',
      port: mf.env.appPort,
      strictPort: true
    },

    build: {
      target: 'chrome89'
    }
  };
});
