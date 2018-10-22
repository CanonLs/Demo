const fs = require('fs');
const ip = require('ip');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const releaseDir = './target';

module.exports = {
    entry: './src/index.js',
    output: {
        filename: '[name].[hash].js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader', // 回滚
                use: ['css-loader', 'postcss-loader']
            })

        }, {
            test: /\.(png|jpg|jpeg|gif|svg)/,
            use: {
                loader: 'url-loader',
                options: {
                    outputPath: 'images/', // 图片输出的路径
                    limit: 5 * 1024
                }
            }
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Output Management',
            template: './src/index.html'
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin('css/index.css') //都提到index.css里面

    ],
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
        port: 9090,
        host: ip.address(),
        hot: true,
        inline: true,
        open: 'Google Chrome'
    }
};
// const compiler = webpack(config);
// //文件落磁盘
// compiler.plugin('emit', (compilation, callback) => {
//     const assets = compilation.assets;
//     let file, data;
//     Object.keys(assets).forEach(key => {
//         file = path.resolve(__dirname, releaseDir, key);
//         data = assets[key].source();
//         fs.writeFileSync(file, data);
//     });
//     callback();
// });