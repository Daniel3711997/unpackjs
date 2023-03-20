const PurgeCSSWithWordpress = require('purgecss-with-wordpress');

const config = require('./app.config');

module.exports = {
    plugins: {
        'postcss-logical': {},
        'postcss-preset-env': {
            stage: 3,
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
