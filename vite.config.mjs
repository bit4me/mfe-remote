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
  const mode = env.mode || 'development';
  const isDevelopment = mode === 'development';

  // 1. 환경변수 파일 선택
  const envPath = path.resolve(
    __dirname,
    isDevelopment ? '.env.dev' : '.env'
  );

  // 2. 환경변수 로드
  const result = dotenv.config({
    path: envPath,
    override: true
  });

  if (result.error) {
    throw new Error(`[Vite] Environment loading failed: ${envPath}`);
  }

  // 3. Federation 설정 로드
  const { default: mf } = await import('./federation/federation.config.mjs');

  const { shared, exposes } = mf;

  console.log('[Vite] Remote Configuration:', {
    mode,
    command: mf.env.command,

    remoteContainerName: mf.remoteContainerName,                   // Module Federation 컨테이너 이름

    entryName: mf.entryName,        // Remote Entry 파일명
    entryNameForViteVarBuild: mf.entryNameForViteVarBuild,  // Remote Entry 파일명 (Vite 의 var 타입)

    remoteFormat: mf.remoteFormat,      // Remote 노출 방식

    exposes: mf.exposes,

    appPort: mf.env.appPort,
  });

  // 4. Vite 설정
  return {
    root: __dirname,

    base: '/',

    plugins: [

      //...(isDevelopment ? [federationRefreshPreamble()] : []),
      isDevelopment && federationRefreshPreamble(),

      react(),

      function federationReactRefreshPreamble() {
        return {
          name: 'federation-react-refresh-preamble',
          enforce: 'pre',

          transformIndexHtml() {
            return [];
          }
        };
      },

      tailwindcss(),

      federation({
        name: mf.remoteContainerName,
        filename: mf.entryName,
        varFilename: mf.entryNameForViteVarBuild, //  vite는 varFilename만 있으면 var 타입 무조건 빌드뎀.
        exposes,
        shared,
        dts: false
      })
    ].filter(Boolean),

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

// Federation Refresh Preamble Plugin
function federationRefreshPreamble() {
  return {
    name: 'federation-refresh-preamble',
    enforce: 'pre',

    transform(code, id) {
      if (
        id.includes('/src/components/') &&
        id.endsWith('.jsx')
      ) {
        return {
          code: `
                import '/federation/refresh-preamble.js';
                ${code}
              `,
          map: null
        };
      }
    }
  };
}
