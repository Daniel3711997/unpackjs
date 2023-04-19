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
const Encore = require('@symfony/webpack-encore');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const Logger = require('@symfony/webpack-encore/lib/logger');
const CompressionPlugin = require('compression-webpack-plugin');
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

const babelCoreVersion = require('@babel/core/package.json').version;
const babelLoaderVersion = require('babel-loader/package.json').version;
const contentOfWebpackConfig = crypto
    .createHash('md5')
    .update(require('fs').readFileSync(__filename, 'utf8'))
    .digest('hex');
const babelCacheIdentifier = `${
    Encore.isProduction() ? 'prod' : 'dev'
}-${babelCoreVersion}~${babelLoaderVersion}-${contentOfWebpackConfig}`;

const patchPlugin = plugin => {
    if ('AssetsWebpackPlugin' === plugin.constructor.name) {
        const processOutput = plugin.options.processOutput;

        plugin.options.processOutput = assets => {
            if ('function' === typeof processOutput) {
                assets = JSON.parse(processOutput(assets));
            }

            if (Encore.isProduction()) {
                assets = {
                    production: true,
                    publicPath: config.publicPath,
                    ...assets,
                };
            }

            return JSON.stringify(assets, null, 4);
        };
    }

    return true; // Return true to keep the plugin in the array or false to remove it
};

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
    if (config.useCompression) {
        Encore.addPlugin(
            new CompressionPlugin({
                exclude: ['manifest.json'],
            })
        );
    }

    Encore.configureBabel(
        babelConfig => {
            babelConfig.cacheIdentifier = babelCacheIdentifier;
            babelConfig.cacheDirectory = path.join(config.cacheDirectory, 'babel');
            babelConfig.presets[1] = ['@babel/preset-react', { runtime: 'automatic' }];

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
        ];
    });

    Encore.configureBabel(
        babelConfig => {
            babelConfig.cacheIdentifier = babelCacheIdentifier;
            babelConfig.cacheDirectory = path.join(config.cacheDirectory, 'babel');
            babelConfig.presets[1] = ['@babel/preset-react', { runtime: 'automatic' }];

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
            appConfig.allowCollectingMemory = !Encore.isProduction();
            appConfig.name = `cache-${Encore.isProduction() ? 'prod' : 'dev'}`;
            appConfig.cacheDirectory = path.join(config.cacheDirectory, 'webpack');
            appConfig.maxMemoryGenerations = Encore.isProduction() ? Infinity : 10;
            appConfig.version = `${Encore.isProduction() ? 'prod' : 'dev'}~${pack.version}`;
        }
    )
    .enableSingleRuntimeChunk()
    .setPublicPath(config.publicPath)
    .enableTypeScriptLoader(options => {
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
    })
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
        config.targets = Encore.isProduction() ? pack.browserslist.production : pack.browserslist.development;
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
        js: !Encore.isProduction() ? 'assets/js/module~[name].js' : 'assets/js/module~[name].[contenthash:12].js',
        css: !Encore.isProduction() ? 'assets/css/module~[name].css' : 'assets/css/module~[name].[contenthash:12].css',
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
        test: /[\\/]src[\\/](?!styles)[\\/]/,
        name: !Encore.isProduction() ? 'unpack' : false,
    })
    .addCacheGroup('styles', {
        priority: 20,
        enforce: false,
        reuseExistingChunk: true,
        test: /[\\/]src[\\/]styles[\\/]/,
        name: !Encore.isProduction() ? 'styles' : false,
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

if (config.useSWC) {
    Encore.configureLoaderRule('javascript', loaderRule => {
        loaderRule.use = config.swcRCConfig(Encore.isProduction(), 'javascript');
    });

    Encore.configureLoaderRule('typescript', loaderRule => {
        loaderRule.use = config.swcRCConfig(Encore.isProduction(), 'typescript');
    });
}

const webpackConfig = config.extra(Encore);

delete webpackConfig.module.rules[4].oneOf[0].resourceQuery;
webpackConfig.module.rules[4].oneOf[0].test = /\.module\.s[ac]ss$/;

module.exports = {
    ...webpackConfig,

    target: `browserslist:${Encore.isProduction() ? 'production' : 'development'}`,

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
        optimization: {
            ...webpackConfig.optimization,
            sideEffects: 'flag',
        },
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

        clean: true,
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

    plugins: webpackConfig.plugins.filter(plugin => {
        return patchPlugin(plugin);
    }),

    snapshot: {
        ...webpackConfig.snapshot,

        managedPaths: [path.join(__dirname, 'node_modules')],
    },

    resolve: {
        ...webpackConfig.resolve,

        symlinks: false,
        plugins: (webpackConfig.resolve.plugins || []).concat([
            new TSConfigPathsPlugin({
                extensions: [
                    '.ts',
                    '.tsx',
                    '.js',
                    '.jsx',
                    '.json',
                    '.css',
                    '.scss',
                    '.png',
                    '.jpg',
                    '.jpeg',
                    '.gif',
                    '.svg',
                ],
            }),
        ]),
    },
};
