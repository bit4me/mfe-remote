// 환경변수를 직접 로드하지 않고,
// 이미 로드된 process.env에서 값을 읽고 검증하는 역할만 담당
// 

const required = (key, fallback = undefined) => {
    const value = process.env[key] ?? fallback;

    if (value === undefined || value === '') {
        throw new Error(
            `[env.config] Missing environment variable: ${key}`
        );
    }

    return value;
};

const numberValue = (key, fallback) => {
    const value = required(key, fallback);
    const number = Number(value);

    if (!Number.isFinite(number) || number <= 0) {
        throw new Error(
            `[env.config] Invalid number environment variable: ${key}=${value}`
        );
    }

    return number;
};

const remoteFormat = required('REMOTE_FORMAT', 'var');

if (!['module', 'var'].includes(remoteFormat)) {
    throw new Error(
        '[env.config] REMOTE_FORMAT must be module or var'
    );
}

const appName = required('APP_NAME');

export default Object.freeze({
    appName,
    appPort: numberValue('APP_PORT', '5000'),

    entryName: required('ENTRY_NAME', 'remoteEntry.js'),

    entryNameForViteVarBuild: required('ENTRY_NAME_FOR_VITE_VAR_BUILD', 'remoteEntry.esm.js'),

    remoteUrl: required('REMOTE_URL', 'http://localhost:5001'),

    remoteFormat
});