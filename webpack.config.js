const path = require('path');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
    ...defaultConfig,
    entry: {
        main: path.resolve(__dirname, 'assets/js/main.ts'),
    },
};
