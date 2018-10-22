// 基于node的 遵循commonjs规范的
let path = require('path'); //node的模块
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PUBLIC_PATH = '/';

module.exports = {
    entry: './src/index.js', // 入口
    output: {
        filename: 'build.js',
        // 这个路径必须是绝对路径
        path: path.resolve('./dist'),
        publicPath: PUBLIC_PATH
    }, // 出口
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        host: 'localhost',
        port: 8080,
        compress: true, // 服务器压缩
        // open: true, // 自动打开浏览器
        // hot: true //热更新
    }, // 开发服务器
    module: {
        rules: [{
                test: /\.css$/,
                use: ExtractTextWebpackPlugin.extract({
                    use: 'css-loader'
                }),
                include: path.join(__dirname, './src'),
                exclude: /node_modules/
            },
            {
                test: /\.(jpg|png|gif|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 1024,
                        outputPath: 'images/'
                    }
                }],
                include: path.join(__dirname, './src'),
                exclude: /node_modules/
            }
        ]
    }, // 模块配置
    plugins: [
        new ExtractTextWebpackPlugin('css/index.css'),
        new HtmlWebpackPlugin({
            minify: {
                removeAttributeQuotes: true,
                hash: true,
                template: './src/index.html',
                filename: 'index.html'
            }
        })
    ], // 插件的配置
    mode: 'development', // 可以更改模式
    resolve: {}, // 配置解析
}
// 在webpack中如何配置开发服务器 webpack-dev-server