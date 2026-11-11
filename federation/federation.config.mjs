
import env from './env.config.mjs';
import shared from './shared.config.mjs';
import exposes from './exposes.config.mjs';

console.log('[Federation] Configuration:', {
    appName: env.appName,
    appPort: env.appPort,
    remoteFormat: env.remoteFormat,
    exposes: Object.keys(exposes)
});

export default Object.freeze({
    env,                        // 애플리케이션 환경변수
    name: env.appName,          // Module Federation 컨테이너 이름
    filename: env.entryName,    // 'remoteEntry.js',   // Remote Entry 파일명

    //library: {
    //    type: env.remoteFormat,
    //    name: env.appName
    //},

    shared,                       // React 등 공통 라이브러리
    exposes,                      // 외부 공개 컴포넌트

    dts: false                    // 타입 선언 파일 생성 비활성화
});
