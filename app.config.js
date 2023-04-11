'use strict';

const path = require('node:path');

module.exports = {
    name: 'UnpackJSDevelopmentPlugin',

    devServer: {
        port: '4000',
        transport: 'ws',
        host: 'localhost',
    },
    /**
     * true: Run "npm run enable-swc" to enable SWC
     * false: Run "npm run disable-swc" to disable SWC
     */
    useSWC: true,
    useESBuildMinifier: true,
    switchToBabelPresetTypescript: false,
    /**
     * false: No jQuery package is loaded
     * true: You have to install the jQuery package
     * external: The jQuery package is loaded by the current theme
     */
    useJQuery: false,
    usePurgeCSS: true,
    purgeCSSIgnore: [],
    useBundleAnalyzer: false,
    manifestKeyPrefix: 'build/',
    /**
     * @param {typeof import('@symfony/webpack-encore')} Encore
     */
    extra(Encore) {
        return Encore.getWebpackConfig();
    },
    useCompression: true,
    useTypeCheckInDev: false,
    /**
     * true: The CSS is embedded in the bundle and webpack is able to lazy load the bundle
     * false: The CSS is not embedded in the bundle and webpack is not able to lazy load the bundle
     */
    disableCssExtraction: true,
    transformImports: {
        lodash: {
            transform: 'lodash/{{member}}',
            /* Babel Template: ${member} | SWC Template: {{member}} */
        },
    },
    outputPath: path.resolve(__dirname, 'build'),
    cacheDirectory: path.resolve(__dirname, 'cache'),

    get publicPath() {
        return `/wp-content/plugins/${this.name}/build/`;
    },
};
