'use strict';

const path = require('node:path');

const pack = require('./package.json');

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
    /**
     * false: No jQuery package is loaded
     * true: You have to install the jQuery package
     * external: The jQuery package is loaded by the current theme
     */
    useJQuery: false,
    usePurgeCSS: false,
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
    /**
     * ESLint & StyleLint
     * TypeScript is not supported, always enabled
     */
    useTypeCheckInProduction: true,
    /**
     * ESLint & StyleLint
     * TypeScript is not supported, always enabled, but on another thread
     */
    useTypeCheckInDevelopment: false,
    /**
     * Note: This should be always true
     *
     * true: The CSS is embedded in the bundle and webpack is able to lazy load the bundle
     * false: The CSS is not embedded in the bundle and webpack is not able to lazy load the bundle
     */
    disableCssExtraction: true,
    transformImports: {
        // lodash: {
        //     transform: '<<TEMPLATE>>'
        //     /* Babel Template: ${member} | SWC Template: {{member}} */
        // }
    },
    outputPath: path.join(__dirname, 'build'),
    cacheDirectory: path.join(__dirname, 'cache'),

    get publicPath() {
        return `/wp-content/plugins/${this.name}/build/`;
    },
    swcRCConfig(isProduction, type) {
        const options = {
            module: {
                type: 'es6',
                ignoreDynamic: true,
            },
            jsc: {
                externalHelpers: true,
                transform: {
                    react: {
                        refresh: true,
                        runtime: 'automatic',
                    },
                },
                experimental: {
                    plugins: [['@swc/plugin-transform-imports', this.transformImports]],
                },
            },
            env: {
                debug: false,
                mode: 'usage',
                coreJs: '3.30.1',
                targets: isProduction ? pack.browserslist.production : pack.browserslist.development,
            },
        };

        switch (type) {
            case 'javascript':
                return {
                    loader: 'swc-loader',
                    options: {
                        ...options,
                        jsc: {
                            ...options.jsc,
                            parser: {
                                jsx: true,
                                syntax: 'ecmascript',
                            },
                        },
                    },
                };

            case 'typescript':
                return {
                    loader: 'swc-loader',
                    options: {
                        ...options,
                        jsc: {
                            ...options.jsc,
                            parser: {
                                tsx: true,
                                syntax: 'typescript',
                            },
                        },
                    },
                };

            default:
                throw new Error(`Unknown type: ${type}`);
        }
    },
};
