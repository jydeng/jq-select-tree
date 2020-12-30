const path = require("path");
const { merge } = require("webpack-merge");
const base = require("./webpack.base");

module.exports = merge(base, {
  mode: "development",
  devtool: "eval-cheap-module-source-map",
  devServer: {
    hot: true,
    contentBase: "./dist",
    host: "0.0.0.0",
    port: 9000,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [path.resolve(__dirname, "../src")],
        exclude: /node_modules/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
});
