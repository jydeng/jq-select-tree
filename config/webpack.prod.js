const path = require("path");
const { merge } = require("webpack-merge");
const base = require("./webpack.base");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(base, {
  // 模式
  mode: "production",
  // devTool配置
  devtool: "cheap-module-source-map",
  module: {
    rules: [
      {
        // 用正则去匹配要用该 loader 转换的 CSS 文件
        test: /\.css$/,
        include: [path.resolve(__dirname, "../src")],
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    // 清空目录
    new CleanWebpackPlugin(),
    // 剥离样式文件
    new MiniCssExtractPlugin({
      filename: `jq-select-tree.[contenthash:8].css`,
    }),
  ],
});
