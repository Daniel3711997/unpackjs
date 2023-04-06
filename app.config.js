'use strict';

/* eslint-disable no-template-curly-in-string */

const path = require('node:path');

module.exports = {
    /**
     * Old Browserslist
     */

    // {
    //     "production": [
    //         ">0.2%",
    //         "not dead",
    //         "not op_mini all"
    //     ],
    //     "development": [
    //         "last 1 chrome version",
    //         "last 1 firefox version",
    //         "last 1 safari version"
    //     ]
    // }

    name: 'UnpackJSDevelopmentPlugin',

    devServer: {
        port: '4000',
        transport: 'ws',
        host: 'localhost',
    },

    /**
     * true: Run npm run enable-swc to enable SWC
     * false: Run npm run disable-swc to disable SWC
     */
    useSWC: true,
    SWCToBabel: false,
    useESBuildMinifier: true,

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
     * true: The CSS is embedded in the bundle and webpack is able to lazy load the bundle
     * false: The CSS is not embedded in the bundle and webpack is not able to lazy load the bundle
     */
    disableCssExtraction: true,

    /**
     * @param {typeof import('@symfony/webpack-encore')} Encore
     */
    extra(Encore) {
        return Encore.getWebpackConfig();
    },

    /**
     * SWC Transform Imports
     */

    transformImports: {
        lodash: {
            transform: 'lodash/{{member}}',
        },
    },

    /**
     * Babel Transform Imports
     */

    // transformImports: {
    //     lodash: {
    //         preventFullImport: true,
    //         transform: 'lodash/${member}',
    //     },
    // },

    useTypeCheckInDev: false,
    outputPath: path.resolve(__dirname, 'build'),
    cacheDirectory: path.resolve(__dirname, 'cache'),

    get publicPath() {
        return `/wp-content/plugins/${this.name}/build/`;
    },
};
