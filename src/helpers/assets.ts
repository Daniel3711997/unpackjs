export const getAssetURI = (asset: string): string => {
    return `${window.appRuntime.pluginURI}/assets/${asset}`;
};
