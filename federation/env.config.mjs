// 환경변수를 직접 로드하지 않고,
// 이미 로드된 process.env에서 값을 읽고 검증하는 역할만 담당
// 

const required = (key, fallback = undefined) => {
    const value = process.env[key] ?? fallback;

    if (value === undefined || value === '') {
        throw new Error(
            `[Federation] Missing environment variable: ${key}`
        );
    }

    return value;
};

const numberValue = (key, fallback) => {
    const value = required(key, fallback);
    const number = Number(value);

    if (!Number.isFinite(number) || number <= 0) {
        throw new Error(
            `[Federation] Invalid number environment variable: ${key}=${value}`
        );
    }

    return number;
};

const remoteFormat = required('REMOTE_FORMAT', 'var');

if (!['module', 'var'].includes(remoteFormat)) {
    throw new Error(
        '[Federation] REMOTE_FORMAT must be module or var'
    );
}

const appName = required('APP_NAME');

export default Object.freeze({
    appName,
    appPort: numberValue('APP_PORT', '5000'),

    entryName: required('ENTRY_NAME', 'remoteEntry.js'),

    remoteUrl: required('REMOTE_URL', 'http://localhost:5001'),
    remoteFormat,

    reactVersion: required('REACT_VERSION', '^18.3.1'),
    reactDomVersion: required('REACT_DOM_VERSION', '^18.3.1')
});