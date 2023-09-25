/* eslint-disable no-template-curly-in-string */

'use strict';

const path = require('node:path');

const pack = require('./package.json');

module.exports = {
    /**
     * The name of the plugin folder
     */
    name: 'UnpackJSDevelopmentPlugin',

    /**
     * Webpack development server configuration
     */
    devServer: {
        port: '4000',
        transport: 'ws',
        host: 'localhost',
    },
    /**
     * Enable or disable the SWC loader
     *
     * true: Run "npm run enable-swc" to enable SWC
     * false: Run "npm run disable-swc" to disable SWC
     */
    useSWC: true,

    /**
     * Enable or disable the ESBuild minifier
     */
    useESBuildMinifier: true,

    /**
     * Enable or disable jQuery
     *
     * false: No jQuery package is loaded
     * true: You have to install the jQuery package
     * external: The jQuery package is loaded by the current theme
     */
    useJQuery: false,

    /**
     * Enable or disable the PurgeCSS plugin
     */
    usePurgeCSS: false,

    /**
     * PurgeCSS ignore list
     */
    purgeCSSIgnore: [],

    /**
     * Enable or disable the bundle analyzer plugin
     */
    useBundleAnalyzer: false,

    /**
     * Manifest key prefix
     */
    manifestKeyPrefix: 'build/',

    /**
     * Encore configuration
     *
     * @param {typeof import('@symfony/webpack-encore')} Encore
     */
    extra(Encore) {
        return Encore.getWebpackConfig();
    },

    /**
     * Enable or disable the compression plugin
     */
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

    /**
     * Output path
     */
    outputPath: path.join(__dirname, 'build'),

    /**
     * Cache directory
     */
    cacheDirectory: path.join(__dirname, 'cache'),

    /**
     * Public path
     */
    get publicPath() {
        return `/wp-content/plugins/${this.name}/build/`;
    },

    /**
     * Transform imports
     */
    get transformImports() {
        return {
            // lodash: {
            //     transform: `lodash/${this.useSWC ? '{{member}}' : '${member}'}`,
            // },
        };
    },

    /**
     * SWC configuration
     */
    swcRCConfig(isProduction, type) {
        const options = {
            $schema: 'https://json.schemastore.org/swcrc',
            module: {
                type: 'es6',
                // ignoreDynamic: true,
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
                    cacheRoot: path.join(this.cacheDirectory, 'swc'),
                    plugins: [['@swc/plugin-transform-imports', this.transformImports]],
                },
            },
            env: {
                debug: false,
                mode: 'usage',
                coreJs: '3.32.2',
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
