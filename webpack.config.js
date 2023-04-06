'use strict';

/* eslint-disable import/order */

const chalk = require('chalk');
const path = require('node:path');
const crypto = require('node:crypto');
const pack = require('./package.json');
const config = require('./app.config');
const app = require('./src/routes.json');
const DotEnv = require('dotenv-webpack');
const WebpackBar = require('webpackbar');
/**
 * @type {typeof import('@symfony/webpack-encore')}
 */
const Encore = require('@symfony/webpack-encore');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const Logger = require('@symfony/webpack-encore/lib/logger');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

Logger.quiet(true);

if (0 === app.routes.length) {
    throw new Error('No routes defined');
}

// prettier-ignore
process.env.NODE_ENV = Encore.isProduction()
                    ? 'production' : 'development';

process.env.BABEL_ENV = process.env.NODE_ENV;
process.env.UNPACK_ENV = process.env.NODE_ENV;
process.env.BROWSERSLIST_ENV = process.env.NODE_ENV;

// https://github.com/symfony/webpack-encore/blob/main/index.js
// https://github.com/symfony/webpack-encore/blob/main/CHANGELOG.md

// npm install webpack webpack-cli @babel/core @babel/preset-env --save-dev
// npm remove @babel/plugin-syntax-dynamic-import @babel/plugin-proposal-class-properties

const babelCoreVersion = require('@babel/core/package.json').version;
const babelLoaderVersion = require('babel-loader/package.json').version;
const contentOfWebpackConfig = crypto.createHash('md5').update(require('fs').readFileSync(__filename, 'utf8')).digest('hex');
const babelCacheIdentifier = `${Encore.isProduction() ? 'prod' : 'dev'}-${babelCoreVersion}~${babelLoaderVersion}-${contentOfWebpackConfig}`;

if (!Encore.isRuntimeEnvironmentConfigured()) {
    // prettier-ignore
    console.log(
        chalk.bgRed(
            chalk.black(
                `Encore is not configured, something went wrong!`
            )
        )
    );

    Encore.configureRuntimeEnvironment(process.env.UNPACK_ENV || 'dev-server');
}

app.routes.forEach(route => {
    Encore.addEntry(route.entry.name, path.join(__dirname, route.entry.path));

    console.log(`Loading route ${chalk.yellow(route.entry.name)} from ${chalk.yellow(route.entry.path)}`);
});

if (config.useJQuery) {
    Encore.autoProvidejQuery();

    if ('external' === config.useJQuery) {
        Encore.addExternals({
            jquery: 'jQuery',
        });
    }
}

if (config.useBundleAnalyzer && Encore.isProduction()) {
    Encore.addPlugin(new BundleAnalyzerPlugin());
}

if (config.useTypeCheckInDev && !Encore.isProduction()) {
    Encore.enableForkedTypeScriptTypesChecking();
}

if (config.useTypeCheckInDev || Encore.isProduction()) {
    Encore.addPlugin(
        new ESLintPlugin({
            cache: true,
            failOnError: true,
            failOnWarning: false,
            context: './src/app',
            cacheStrategy: 'metadata',
            extensions: ['js', 'jsx', 'ts', 'tsx'],
            cacheLocation: path.join(config.cacheDirectory, 'eslint/'),
        })
    );

    Encore.addPlugin(
        new StyleLintPlugin({
            cache: true,
            failOnError: true,
            failOnWarning: false,
            context: './src/styles',
            cacheStrategy: 'metadata',
            extensions: ['css', 'scss'],
            cacheLocation: path.join(config.cacheDirectory, 'stylelint/'),
        })
    );
}

if (Encore.isProduction()) {
    Encore.configureBabel(
        babelConfig => {
            // https://webpack.js.org/loaders/babel-loader/
            babelConfig.cacheIdentifier = babelCacheIdentifier;
            babelConfig.cacheDirectory = path.join(config.cacheDirectory, 'babel');
            babelConfig.presets[config.SWCToBabel ? 2 : 1] = ['@babel/preset-react', { runtime: 'automatic' }];

            babelConfig.plugins.push(
                ['transform-imports', config.transformImports],
                ['@babel/plugin-transform-runtime', { version: '^7.21.4', regenerator: false }]
            );
        },
        {
            includeNodeModules: pack.includeNodeModules,
        }
    );
}

if (Encore.isDevServer()) {
    Encore.addPlugin(
        new ReactRefreshWebpackPlugin({
            overlay: false,
        })
    );

    Encore.configureDevServerOptions(options => {
        options.hot = true;

        options.client = {
            ...options.client,

            overlay: false,
            logging: 'none',

            webSocketURL: {
                ...options.client?.webSocketURL,

                port: config.devServer.port,
                hostname: config.devServer.host,
                protocol: config.devServer.transport,
                pathname: `/${config.devServer.transport}`,
            },

            webSocketTransport: config.devServer.transport,
        };

        options.allowedHosts = 'all';
        options.host = config.devServer.host;
        options.port = config.devServer.port;
        options.webSocketServer = config.devServer.transport;
        options.headers = [
            ...(Array.isArray(options?.headers) ? options?.headers : []),
            {
                key: 'Access-Control-Allow-Origin',
                value: '*',
            },
            // {
            //     key: 'Cache-Control',
            //     value: 'no-cache, no-store, max-age=0, must-revalidate',
            // },
        ];
    });

    Encore.configureBabel(
        babelConfig => {
            // https://webpack.js.org/loaders/babel-loader/
            babelConfig.cacheIdentifier = babelCacheIdentifier;
            babelConfig.cacheDirectory = path.join(config.cacheDirectory, 'babel');
            babelConfig.presets[config.SWCToBabel ? 2 : 1] = ['@babel/preset-react', { runtime: 'automatic' }];

            babelConfig.plugins.push(
                'react-refresh/babel',
                ['transform-imports', config.transformImports],
                ['@babel/plugin-transform-runtime', { version: '^7.21.4', regenerator: false }]
            );
        },
        {
            includeNodeModules: pack.includeNodeModules,
        }
    );
}

if (config.SWCToBabel) {
    Encore.enableBabelTypeScriptPreset({
        isTSX: true,
        allExtensions: true,
    });
} else {
    // https://github.com/TypeStrong/ts-loader
    Encore.enableTypeScriptLoader(options => {
        options.experimentalWatchApi = true;

        options.compilerOptions = {
            ...options.compilerOptions,

            tsBuildInfoFile: path.join(config.cacheDirectory, 'typescript', '.tsbuildinfo'),
        };

        if (Encore.isProduction()) {
            options.transpileOnly = false;

            options.compilerOptions = {
                ...options.compilerOptions,

                noEmit: false,
                sourceMap: false,
            };
        } else {
            options.transpileOnly = true;

            options.compilerOptions = {
                ...options.compilerOptions,

                noEmit: true,
                sourceMap: true,
            };
        }
    });
}

// prettier-ignore
Encore
    .enableSassLoader()
    .splitEntryChunks()
    .enableReactPreset()
    .enablePostCssLoader()
    .disableCssExtraction(config.disableCssExtraction && !Encore.isProduction())
    .enableBuildCache(
        {
            config: [
                __filename,
                path.join(__dirname, 'package.json'),
                path.join(__dirname, 'tsconfig.json'),
                path.join(__dirname, 'app.config.js'),
                path.join(__dirname, 'postcss.config.js')
            ],
        },

        appConfig => {
            appConfig.profile = false;
            appConfig.maxAge = 5184000000;
            // appConfig.memoryCacheUnaffected = true;
            appConfig.allowCollectingMemory = !Encore.isProduction();
            appConfig.name = `cache-${Encore.isProduction() ? 'prod' : 'dev'}`;
            appConfig.cacheDirectory = path.join(config.cacheDirectory, 'webpack');
            appConfig.maxMemoryGenerations = Encore.isProduction() ? Infinity : 10;
            appConfig.version = `${Encore.isProduction() ? 'prod' : 'dev'}~${pack.version}`;
        }
    )
    .cleanupOutputBeforeBuild()
    .enableSingleRuntimeChunk()
    .setPublicPath(config.publicPath)
    .enableVersioning(Encore.isProduction())
    .enableSourceMaps(!Encore.isProduction())
    .setManifestKeyPrefix(config.manifestKeyPrefix)
    .setOutputPath(Encore.isProduction() ? config.outputPath + '_temporary' : config.outputPath)
    .addPlugin(
        new DotEnv({
            silent: true,
        })
    )
    .addPlugin(
        new WebpackBar({
            name: Encore.isProduction() ? 'Production' : 'Development',
        })
    )
    .configureBabelPresetEnv(config => {
        config.modules = "auto";
        config.corejs = '3.29.1';
        config.useBuiltIns = 'usage';
        config.targets = pack.browserslist;
    })
    .configureCssLoader(function (config) {
        config.url = true;

        config.modules = {
            ...config.modules,

            localIdentName: Encore.isProduction() ? '[hash:base64:12]' : '[name]__[local]--[hash:base64:12]'
        };
    })
    .configureFriendlyErrorsPlugin(options => {
        options.clearConsole = true;
        options.logLevel = 'WARNING';
    })
    .configureTerserPlugin(options => {
        if (config.useSWC) {
            options.minify = TerserPlugin.swcMinify;
        } if (config.useESBuildMinifier) {
            options.minify = TerserPlugin.esbuildMinify;
        } else {
            options.extractComments = false;

            options.terserOptions = {
                ...options.terserOptions,
                format: {
                    ...options.terserOptions?.format,
                    comments: false,
                },
                compress: {
                    ...options.terserOptions?.compress,
                    drop_console: false,
                },
            };
        }
    })
    .configureCssMinimizerPlugin(options => {
        if (config.useESBuildMinifier) {
            options.minify = CssMinimizerPlugin.esbuildMinify;
        }
    })
    .configureFontRule({
        type: 'asset',
        maxSize: 12 * 1024,
        filename: 'assets/fonts/[name].[contenthash:12][ext]',
    })
    .configureImageRule({
        type: 'asset',
        maxSize: 12 * 1024,
        filename: 'assets/images/[name].[contenthash:12][ext]',
    })
    .configureFilenames({
        assets: 'assets/vendors/[name].[contenthash:12][ext]',
        js: !Encore.isProduction() ? 'module~[name].js' : 'module~[name].[contenthash:12].js',
        css: !Encore.isProduction() ? 'module~[name].css' : 'module~[name].[contenthash:12].css',
    })
    .configureSplitChunks(options => {
        options.chunks = 'all';
        options.minChunks = 1;
        options.minSize = 12000;
        options.maxAsyncRequests = 40;
        options.maxInitialRequests = 40;
    })
    .addCacheGroup('unpack', {
        priority: 30,
        enforce: false,
        reuseExistingChunk: true,
        test: /[\\/]src[\\/](?!styles)/,
        name: !Encore.isProduction() ? 'unpack' : false,
    })
    .addCacheGroup('styles', {
        priority: 20,
        enforce: true,
        type: 'css/mini-extract',
        reuseExistingChunk: true,
        name: !Encore.isProduction() ? 'styles' : false,
        test: /[\\/]src[\\/]styles[\\/]|[\\/]node_modules[\\/]/,
    })
    .addCacheGroup('modules', {
        priority: 10,
        enforce: false,
        reuseExistingChunk: true,
        test: /[\\/]node_modules[\\/]/,
        name: !Encore.isProduction() ? 'node_modules' : false,
    })
    // https://github.com/vercel/next.js/blob/54ca8f41cee490989cdd8d5df8db96307075296c/packages/next/build/webpack-config.ts#L776
    .addCacheGroup('framework', {
        priority: 40,
        enforce: true,
        name: 'framework',
        reuseExistingChunk: true,
        test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
    });

if (config.useSWC && !config.SWCToBabel) {
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
                plugins: [['@swc/plugin-transform-imports', config.transformImports]],
            },
        },
        env: {
            mode: 'usage',
            coreJs: '3.29.1',
            targets: pack.browserslist,

            // This is for the old browserslist config
            // targets: Encore.isProduction() ? pack.browserslist.production : pack.browserslist.development,
        },
    };

    Encore.configureLoaderRule('javascript', loaderRule => {
        loaderRule.use = {
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
    });

    Encore.configureLoaderRule('typescript', loaderRule => {
        loaderRule.use = {
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
    });
}

const webpackConfig = config.extra(Encore);

// Enable CSS Modules
delete webpackConfig.module.rules[4].oneOf[0].resourceQuery;
webpackConfig.module.rules[4].oneOf[0].test = /\.module\.s[ac]ss$/;

module.exports = {
    ...webpackConfig,

    target: 'browserslist',

    // experiments: {
    //     ...webpackConfig.experiments,
    //     cacheUnaffected: true,
    // },

    ...(Encore.isProduction() && {
        bail: true,
        optimization: {
            ...webpackConfig.optimization,

            sideEffects: true,
            emitOnErrors: false,
        },
    }),

    ...(!Encore.isProduction() && {
        stats: 'none',
        sideEffects: 'flag',
        devtool: 'inline-source-map',
        infrastructureLogging: {
            ...webpackConfig.infrastructureLogging,
            level: 'warn',
        },
        experiments: {
            ...webpackConfig.experiments,
            lazyCompilation: config.disableCssExtraction,
        },
    }),

    output: {
        ...webpackConfig.output,

        pathinfo: false,
        globalObject: 'self',
        chunkLoadingGlobal: 'unpack',

        ...(!Encore.isProduction() && {
            publicPath: `http://${config.devServer.host}:${config.devServer.port}${config.publicPath}`,
        }),
    },

    optimization: {
        ...webpackConfig.optimization,

        usedExports: true,
        providedExports: true,
    },

    snapshot: {
        ...webpackConfig.snapshot,

        managedPaths: [path.join(__dirname, 'node_modules')],
    },

    resolve: {
        ...webpackConfig.resolve,

        symlinks: false,
        plugins: (webpackConfig.resolve.plugins || []).concat([
            new TSConfigPathsPlugin({
                extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss', '.png', '.jpg', '.jpeg', '.gif', '.svg'],
            }),
        ]),
    },

    plugins: webpackConfig.plugins.filter(plugin => {
        if ('AssetsWebpackPlugin' === plugin.constructor.name) {
            const processOutput = plugin.options.processOutput;

            // const replacer = (key, value) => {
            //     if ('string' !== typeof value) {
            //         return value;
            //     }

            //     return Encore.isProduction()
            //         ? value
            //         : value
            //               .replace(/localhost:/g, `${config.devServer.host}:`)
            //               .replace(/:8080/g, `:${'auto' !== config.devServer.port ? config.devServer.port : '8080'}`);
            // };

            plugin.options.processOutput = assets => {
                if ('function' === typeof processOutput) {
                    assets = JSON.parse(processOutput(assets));
                }

                if (Encore.isProduction()) {
                    assets = {
                        // prettier-ignore
                        // [Encore.isProduction()
                        //     ? 'production'
                        //     : 'development']: Encore.isProduction(),

                        production: true,
                        publicPath: config.publicPath,
                        ...assets,
                    };
                }

                return JSON.stringify(assets, null /* replacer */, 4);
            };
        }

        return (
            'EnabledButKeepHere_WebpackManifestPlugin' !== plugin.constructor.name && 'EnabledButKeepHere_AssetOutputDisplayPlugin' !== plugin.constructor.name
        );
    }),
};
