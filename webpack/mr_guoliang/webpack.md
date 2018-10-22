# webpack 配置

## npm

devDependencies

```sh
npm i webpack webpack-dev-server webpack-cli -D

npm i style-loader css-loader postcss-loader sass-loader html-loader file-loader url-loader -D
npm i node-sass autoprefixer -D

npm i babel-loader -D
npm i @babel/core @babel/preset-env @babel/preset-react -D
npm i @babel/plugin-proposal-class-properties -D
npm i @babel/plugin-syntax-dynamic-import -D

npm i html-webpack-plugin mini-css-extract-plugin optimize-css-assets-webpack-plugin uglifyjs-webpack-plugin -D

# typescript
npm i typescript -D
npm i ts-loader -D
```

dependencies

```sh
npm i qs lodash
npm i axios whatwg-fetch abortcontroller-polyfill
npm i moment dayjs
npm i blueimp-md5 js-base64 mobile-detect
npm i marked codemirror pell highlight.js clipboard holderjs
npm i animejs

npm i @babel/polyfill
```

package.json

```json
"scripts": {
    "deploy": "bin/scp.sh",
    "build": "rm -rf dist && NODE_ENV=production webpack --mode production --progress",
    "dev": "NODE_ENV=development webpack-dev-server -d --hot --inline --progress",
    "test": "rm -rf dist && NODE_ENV=development webpack --mode development --progress"
  },
```

## babel

babel.config.js

```js
module.exports = {
  presets: ["@babel/env", "@babel/preset-react"],
  plugins: ["@babel/plugin-proposal-class-properties"]
};
```

## postcss

postcss.config.js

```js
module.exports = {
  plugins: {
    autoprefixer: {}
  }
};
```

## browserslist

.browserslistrc

```sh
> 1%
last 2 versions
not ie <= 8
Android >= 4
iOS >= 8
Firefox >= 20
ie 6-11
```

## 一个 react 项目 需要的 webpack 配置

devDependencies

```sh
npm i react react-dom prop-types react-router-dom redux react-redux
```

dependencies

```sh
npm i react react-dom prop-types redux react-redux react-router-dom
# typescript
npm i @types/react @types/react-dom @types/react-router-dom @types/react-redux -D
```

## 一个 vue 项目 需要的 webpack 配置

devDependencies

```sh
npm i vue-loader vue-style-loader vue-template-compiler -D
```

dependencies

```sh
npm i vue vue-router vuex
```

## webpack

webpack.config.js

```js
const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
  mode: "none", // development | production
  entry: {
    main: __dirname + "/src/index.js"
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "app.js"
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      hash: true,
      template: path.resolve(__dirname, "public/index.html")
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new MiniCssExtractPlugin({
      filename: "css/style.[name].css",
      chunkFilename: "css/app.[contenthash:12].css" // use contenthash *
    }),
    new webpack.HotModuleReplacementPlugin()
  ],

  optimization: {
    runtimeChunk: {
      name: "manifest"
    },
    splitChunks: {
      chunks: "async",
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      name: false,
      cacheGroups: {
        vendor: {
          name: "vendor",
          chunks: "initial",
          priority: -10,
          reuseExistingChunk: false,
          test: /node_modules\/(.*)\.js/
        },
        styles: {
          name: "styles",
          test: /\.(scss|css|less)$/,
          chunks: "all", // merge all the css chunk to one file
          minChunks: 1,
          reuseExistingChunk: true,
          enforce: true
        }
      }
    },
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCSSAssetsPlugin({}) // 压缩css
    ]
  }
};
```

## js

```js
{
  test: /\.js$/,
  use: ["babel-loader"],
  exclude: /node_modules/
},
```

## html

```js
{
  test: /\.html$/,
  use: [
    {
      loader: "html-loader",
      options: {
        root: path.resolve(__dirname, "src"),
        attrs: ["img:src", "link:href"]
      }
    }
  ]
}
```

## image

```js
{
  test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
  use: [
    {
      loader: "url-loader",
      options: {
        limit: 10000,
        name: "images/[name].[hash:7].[ext]"
      }
    }
  ]
}
```

## css

```js
{
  test: /\.(css|scss)$/,
  use: [
    MiniCssExtractPlugin.loader,
    "css-loader",
    "postcss-loader",
    {
      loader: "sass-loader",
      options: {
        data: fs.readFileSync("src/assets/css/var.css", "utf-8")
      }
    }
  ]
},
```

## dfs

```js
{
  test: /\.less$/,
  use: [
    MiniCssExtractPlugin.loader,
    "css-loader",
    "postcss-loader",
    "less-loader"
  ]
},
{
  test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
  use: [
    {
      loader: "url-loader",
      options: {
        limit: 10000,
        name: "fonts/[name].[hash:7].[ext]"
      }
    }
  ]
},
{
  test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
  use: [
    {
      loader: "url-loader",
      options: {
        limit: 10000,
        name: "media/[name].[hash:7].[ext]"
      }
    }
  ]
}
```

## resolve

```js
resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
      "@": path.resolve(__dirname, "src")
    },
    extensions: [".js", ".jsx", ".vue"]
  }
```

## webpack-dev-server

```js
devServer: {
    host: "0.0.0.0",
    port: 3300,
    historyApiFallback: true,
    disableHostCheck: true,
    hot: true,
    proxy: {
      "/api/upload": {
        secure: false,
        // target: "http://0.0.0.0:4000",
        target: "http://api.adebibi.com:4000",
        changeOrigin: true,
        // pathRewrite: {
        //   "^/api": ""
        // },
        onProxyReq(proxyReq, req, res) {
          // console.log(proxyReq);
          // console.log(res);
        }
      }
    }
  },
```

## more

```js
devtool: "#source-map";
```
