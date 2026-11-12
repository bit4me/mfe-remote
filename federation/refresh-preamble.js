import RefreshRuntime from 'react-refresh/runtime';

if (!window.__MFE_REFRESH_INITIALIZED__) {
    RefreshRuntime.injectIntoGlobalHook(window);

    window.$RefreshReg$ = () => { };
    window.$RefreshSig$ = () => (type) => type;

    window.__vite_plugin_react_preamble_installed__ = true;

    window.__MFE_REFRESH_INITIALIZED__ = true;
}