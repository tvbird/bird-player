const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/index.js',

    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },

    output: {
        filename: 'bundle.js',
        library: 'BirdPlayer',
        libraryTarget: 'umd',
        libraryExport: 'default',
        path: path.join(process.cwd(), '/dist'),
        publicPath: '/'
        // globalObject: '(typeof self !== "undefined" ? self : this)',
    }
};
