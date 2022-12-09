const path = require('path');
const pckg = require('./package.json');

module.exports = {
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
    /**
     * @param {typeof import('@symfony/webpack-encore')} Encore
     */
    extra(Encore) {
        return Encore.getWebpackConfig();
    },

    // Change this to true if you want error checking...
    useTypeCheckInDev: false,
    outputPath: path.resolve(__dirname, 'build'),
    cacheDirectory: path.resolve(__dirname, 'cache'),
    publicPath: `/wp-content/plugins/${pckg.name}/build`,
};
