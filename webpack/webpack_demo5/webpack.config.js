const path = require('path');
const ip = require('ip');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        // publicPath:'/src',
        filename: 'js/main.[hash].js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        publicPath: '../'
                    }
                },
                // {
                //     loader: 'style-loader'
                // },
                {
                    loader: 'css-loader',
                    options: { sourceMap: true }
                },
                {
                    loader: 'postcss-loader'
                },
                {
                    loader: 'sass-loader',
                    options: { sourceMap: true }
                }
            ]
        }, {
            test: /\.(png|svg|jpg|gif|jpeg)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: "sources/images/[name].[hash].[ext]"
                }
            }]
        }, 
        // {
        //     test: /\.html$/,
        //     loader: "raw-loader"
        // }
    ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].[hash].css',
            chunkFilename: '[id].[hash].css'
        }),
        new HtmlWebpackPlugin({
            // title: 'AICODER 全栈线下实习', // 默认值：Webpack App
            // filename: 'main.html', // 默认值： 'index.html'
            template: path.resolve(__dirname, 'src/index.html'),
            minify: {
                // collapseWhitespace: true,
                removeComments: true, //移除注释
                removeAttributeQuotes: false // 移除属性的引号
            }
        }),
        new CleanWebpackPlugin(['dist']),
        new webpack.NamedModulesPlugin(), // 更容易查看(patch)的依赖
        new webpack.HotModuleReplacementPlugin(), // 替换插件
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ],
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true // set to true if you want JS source maps
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.join(__dirname, "src"),
        port: 9090,
        host: ip.address(),
        hot: false,
        inline: true,
        open: 'Google Chrome',
        hotOnly: true,
    }
}