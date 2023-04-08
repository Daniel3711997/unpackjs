const PurgeCSSWithWordpress = require('purgecss-with-wordpress');

const config = require('./app.config');
const pack = require('./package.json');

const isProduction = 'production' === process.env.NODE_ENV;

module.exports = {
    plugins: {
        'postcss-logical': {},
        'postcss-preset-env': {
            stage: 2,
            browsers: isProduction ? pack.browserslist.production : pack.browserslist.development,
        },
        'postcss-flexbugs-fixes': {},
        ...(config.usePurgeCSS && {
            '@fullhuman/postcss-purgecss': {
                content: ['./src/**/*.{js,jsx,ts,tsx}'],
                defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
                safelist: [...PurgeCSSWithWordpress.safelist, ...config.purgeCSSIgnore],
            },
        }),
    },
};
