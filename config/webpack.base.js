const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    "jq-select-tree": "./src/main.js",
  },
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "../dist"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, "../src")],
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              presets: ["@babel/preset-env"],
              plugins: [
                [
                  "@babel/plugin-transform-runtime",
                  {
                    // 3: 实现对于实例方法的支持
                    corejs: 3,
                  },
                ],
              ],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "jq-select-tree",
      filename: "index.html",
      template: path.resolve(__dirname, "../src/template.html"),
    }),
  ],
  externals: {
    jQuery: "jQuery",
  },
};
