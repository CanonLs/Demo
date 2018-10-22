const path = require('path');
const HtmlWebpackPllugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin'); //引入 
const webpack = require('webpack');

module.exports = {
    entry: {
        index: "./scripts/index.js" //入口文件，若不配置webpack4将自动查找src目录下的index.js文件
    },
    output: {
        filename: "[name].bundle.[hash].js", //输出文件名，[name]表示入口文件js名
        path: path.join(__dirname, "dist") //输出文件路径
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }, {
            test: /\.(png|jpg|gif)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    outputPath: 'images/',
                    limit: 500 //是把小于500B的文件打成Base64的格式，写入JS
                }
            }]

        }]
    },
    plugins: [
        new HtmlWebpackPllugin({
            filename: 'index.html',
            template: './index.html'
        }),
        // new CleanWebpackPlugin(['dist']), //传入数组,指定要删除的目录
        new webpack.HotModuleReplacementPlugin()

    ],
    devServer: { //配置此静态文件服务器，可以用来预览打包后项目
        inline: true, //打包后加入一个websocket客户端
        hot: true, //热加载
        contentBase: path.resolve(__dirname, 'dist'), //开发服务运行时的文件根目录
        host: 'localhost', //主机地址
        port: 9090, //端口号
        compress: true //开发服务器是否启动gzip等压缩
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: { // 抽离自己写的公共代码
                    chunks: "initial",
                    name: "common", // 打包后的文件名，任意命名
                    minChunks: 2, //最小引用2次
                    minSize: 0 // 只要超出0字节就生成一个新包
                },
                vendor: { // 抽离第三方插件
                    test: /node_modules/, // 指定是node_modules下的第三方包
                    chunks: 'initial',
                    name: 'vendor', // 打包后的文件名，任意命名
                    // 设置优先级，防止和自定义的公共代码提取时被覆盖，不进行打包
                    priority: 10
                },
            }
        }
    }

}