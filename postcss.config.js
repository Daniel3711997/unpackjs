const config = require('./app.config');
const PurgeCSSWithWordpress = require('purgecss-with-wordpress');

const plugins = [
    'postcss-logical',
    'postcss-flexbugs-fixes',
    [
        'postcss-preset-env',
        {
            stage: 3,
            autoprefixer: {
                flexbox: 'no-2009',
            },
            features: {
                'custom-properties': false,
            },
        },
    ],
];

if (config.usePurgeCSS) {
    plugins.push([
        '@fullhuman/postcss-purgecss',
        {
            content: ['./src/**/*.{js,jsx,ts,tsx}'],
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
            safelist: [...PurgeCSSWithWordpress.safelist, ...config.purgeCSSIgnore],
        },
    ]);
}

module.exports = {
    plugins,
};
