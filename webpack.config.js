// https://github.com/symfony/webpack-encore/blob/main/index.js

const path = require('path');
const chalk = require('chalk');
const pack = require('./package.json');
const config = require('./app.config');
const app = require('./src/routes.json');
const DotEnv = require('dotenv-webpack');
const WebpackBar = require('webpackbar');
const Encore = require('@symfony/webpack-encore');
const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

if (0 === app.routes.length) {
    throw new Error('No routes defined');
}

if (!Encore.isRuntimeEnvironmentConfigured()) {
    console.log(
        chalk.bgRed(
            chalk.black(
                `Encore is not configured, something went wrong! The process.env.NODE_ENV is set to ${
                    process.env.NODE_ENV || 'dev-server'
                }`
            )
        )
    );

    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev-server');
}

app.routes.forEach(route => {
    Encore.addEntry(route.entry.name, path.resolve(__dirname, route.entry.path));

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
            cacheLocation: path.join(config.cacheDirectory, 'eslint', 'cache'),
        })
    );

    Encore.addPlugin(
        new StylelintPlugin({
            cache: true,
            failOnError: true,
            failOnWarning: false,
            context: './src/styles',
            cacheStrategy: 'metadata',
            extensions: ['css', 'scss'],
            cacheLocation: path.join(config.cacheDirectory, 'stylelint', 'cache'),
        })
    );
}

if (Encore.isDevServer()) {
    Encore.configureDevServerOptions(options => {
        options.hot = true;

        options.client = {
            ...options.client,
            overlay: false,
            logging: 'none',

            webSocketURL: {
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
    });

    Encore.addPlugin(
        new ReactRefreshWebpackPlugin({
            overlay: false,
        })
    );

    Encore.configureBabel(babelConfig => {
        babelConfig.plugins.push('react-refresh/babel', '@babel/plugin-transform-runtime');
    });
}

// prettier-ignore
Encore
    .enableSassLoader()
    .splitEntryChunks()
    .enableReactPreset()
    .enablePostCssLoader()
    .disableCssExtraction(!Encore.isProduction())
    .enableTypeScriptLoader(options => {
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
    .enableBuildCache(
        {
            config: [__filename],
        },

        appConfig => {
            appConfig.profile = false;
            appConfig.name = `cache-${Encore.isProduction() ? 'prod' : 'dev'}`;
            appConfig.cacheDirectory = path.join(config.cacheDirectory, 'webpack');
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
        config.corejs = 3;
        config.useBuiltIns = 'entry';
    })
    .configureCssLoader(function (config) {
        config.modules.localIdentName = '[name]__[local]--[hash:base64:5]';
    })
    .configureFriendlyErrorsPlugin(options => {
        options.clearConsole = true;
        options.logLevel = 'WARNING';
    })
    .configureBabel(babelConfig => {
        babelConfig.presets[1] = [
            '@babel/preset-react',
            {
                runtime: 'automatic',
            },
        ];
        babelConfig.cacheDirectory = path.join(config.cacheDirectory, 'babel');
    })
    .configureTerserPlugin(options => {
        options.extractComments = false;
        options.terserOptions = { format: { comments: false }, compress: { drop_console: true } };
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
        priority: 10,
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
        priority: 30,
        enforce: false,
        reuseExistingChunk: true,
        test: /[\\/]node_modules[\\/]/,
        name: !Encore.isProduction() ? 'node_modules' : false,
    })
    .addCacheGroup('framework', {
        priority: 40,
        enforce: true,
        name: 'framework',
        reuseExistingChunk: true,
        test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription|object-assign)[\\/]/,
    });

const webpackConfig = config.extra(Encore);

/**
 * Enable CSS Modules
 */
delete webpackConfig.module.rules[4].oneOf[0].resourceQuery;
webpackConfig.module.rules[4].oneOf[0].test = /\.module\.s[ac]ss$/;

module.exports = {
    ...webpackConfig,
    target: 'browserslist',
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
        infrastructureLogging: {
            level: 'warn',
        },
        devtool: 'eval-source-map', // 'inline-source-map',
    }),
    output: {
        ...webpackConfig.output,

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
        managedPaths: [path.resolve(__dirname, 'node_modules')],
    },
    resolve: {
        ...webpackConfig.resolve,

        plugins: (webpackConfig.resolve.plugins || []).concat([
            new TSConfigPathsPlugin({
                extensions: ['.ts', '.tsx', '.js', '.jsx'],
            }),
        ]),
    },
    plugins: webpackConfig.plugins.filter(plugin => {
        if (Encore.isProduction() && 'AssetsWebpackPlugin' === plugin.constructor.name) {
            const processOutput = plugin.options.processOutput;

            const replacer = (key, value) => {
                if ('string' !== typeof value) {
                    return value;
                }

                return Encore.isProduction()
                    ? value
                    : value
                          .replace(/localhost:/g, `${config.devServer.host}:`)
                          .replace(/:8080/g, `:${'auto' !== config.devServer.port ? config.devServer.port : '8080'}`);
            };

            plugin.options.processOutput = assets => {
                if ('function' === typeof processOutput) {
                    assets = JSON.parse(processOutput(assets));
                }

                assets = {
                    [Encore.isProduction() ? 'production' : 'development']: Encore.isProduction(),
                    publicPath: config.publicPath,
                    ...assets,
                };

                return JSON.stringify(assets, replacer, 4);
            };
        }

        return (
            'WebpackManifestPlugin' !== plugin.constructor.name &&
            'EnabledButKeepHere_AssetOutputDisplayPlugin' !== plugin.constructor.name
        );
    }),
};
