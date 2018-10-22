const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

// vue
// const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = {
  mode: "none", // development | production
  entry: {
    main: __dirname + "/src/main.js"
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath:'/',
    filename: "static/js/app.js"
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel-loader"],
        exclude: /node_modules/
      },
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
      },
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
      },
      // {
      //   test: /\.vue$/,
      //   use: [
      //     {
      //       loader: "vue-loader"
      //     }
      //   ]
      // }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      hash: true,
      chunksSortMode: "none",
      template: path.resolve(__dirname, "public/index.html")
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      storage: [path.join(__dirname, "src/assets/js/storage.js"), "default"],
      dispatchRequest: [
        path.join(__dirname, "src/api/dispatchRequest.js"),
        "default"
      ]
    }),
    new MiniCssExtractPlugin({
      filename: "css/style.[name].css",
      chunkFilename: "css/app.[contenthash:12].css" // use contenthash *
    }),
    new webpack.HotModuleReplacementPlugin(),
    // new VueLoaderPlugin()
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
  },

  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
      "@": path.resolve(__dirname, "src")
    },
    extensions: [".js", ".jsx", ".vue"]
  },

  devServer: {
    host: "0.0.0.0",
    port: 3000,
    historyApiFallback: true,
    disableHostCheck: true,
    hot: true,
    proxy: {
      "/api": {
        secure: false,
        target: "http://api.adebibi.com",
        changeOrigin: true,
        pathRewrite: {
          "^/api": ""
        }
      }
    }
  },
  // devtool: "#source-map"
};
