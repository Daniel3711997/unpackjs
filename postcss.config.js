const PurgeCSSWithWordpress = require('purgecss-with-wordpress');

const config = require('./app.config');
const pack = require('./package.json');

const isProduction = 'production' === process.env.NODE_ENV;

module.exports = {
    plugins: {
        ...(config.usePurgeCSS && {
            '@fullhuman/postcss-purgecss': {
                content: ['./{app,themes}/**/*.php', './src/**/*.{js,jsx,ts,tsx}'],
                defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
                safelist: [...PurgeCSSWithWordpress.safelist, ...config.purgeCSSIgnore],
            },
        }),
        'postcss-preset-env': {
            stage: 4,
            browsers: isProduction ? pack.browserslist.production : pack.browserslist.development,
        },
    },
};
