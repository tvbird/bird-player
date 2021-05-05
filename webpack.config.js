const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const config = require('config');

/*-------------------------------------------------*/

module.exports = {
    mode: ( process.env.NODE_ENV ? process.env.NODE_ENV : 'development' ),
    entry: './src/index.js',

    output: {
        library: 'BirdPlayer',
        libraryTarget: 'umd',
        globalObject: '(typeof self !== "undefined" ? self : this)',
        libraryExport: 'default',
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        publicPath: config.get('publicPath')
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    },

    plugins: [
        new HTMLWebpackPlugin({
            template: path.resolve(__dirname, 'index.html')
        })
    ],

    devServer: {
        historyApiFallback: true, // must be `true` for SPAs
        open: config.get('open')  // open browser on server start
    },

    // source map
    devtool: ( 'production' === process.env.NODE_ENV ? 'source-map' : 'cheap-module-eval-source-map' ),
};
