
import env from './env.config.mjs';
import shared from './shared.config.mjs';
import exposes from './exposes.config.mjs';

export default Object.freeze({
    env,                        // 애플리케이션 환경변수

    remoteContainerName: env.remoteContainerName,       // Module Federation 컨테이너 이름

    entryName: env.entryName,    // 'remoteEntry.js',   // Remote Entry 파일명
    entryNameForViteVarBuild: env.entryNameForViteVarBuild,    // VITE 빌드로 var 타입 빌드시 Entry 파일명

    remoteFormat: env.remoteFormat,

    shared,                       // React 등 공통 라이브러리
    exposes,                      // 외부 공개 컴포넌트

    dts: false                    // 타입 선언 파일 생성 비활성화
});
