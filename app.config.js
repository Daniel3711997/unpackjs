/* eslint-disable no-template-curly-in-string */

const path = require('node:path');

module.exports = {
    name: 'UnpackJSDevelopmentPlugin',

    devServer: {
        port: '4000',
        transport: 'ws',
        host: 'localhost',
    },
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
    disableCssExtraction: false,
    /**
     * @param {typeof import('@symfony/webpack-encore')} Encore
     */
    extra(Encore) {
        return Encore.getWebpackConfig();
    },

    transformImports: {
        lodash: {
            preventFullImport: true,
            transform: 'lodash/${member}',
        },
    },

    // Change this to true if you want error checking...
    useTypeCheckInDev: false,
    outputPath: path.resolve(__dirname, 'build'),
    cacheDirectory: path.resolve(__dirname, 'cache'),
    get publicPath() {
        return `/wp-content/plugins/${this.name}/build`;
    },
};
