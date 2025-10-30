const path = require("path");
const webpack = require("webpack");

var config = {
  devtool: "inline-source-map",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      url: false,
      https: false,
      http: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: "babel-loader",
        exclude: [/node_modules/],
        include: [path.resolve(__dirname, "tests")],
      },
      {
        test: /\.(js)$/,
        exclude: [/node_modules/],
        include: [path.resolve(__dirname, "tests")],
        loader: "babel-loader",
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        loader: 'file-loader',
        exclude: [/node_modules/],
        options: {outputPath: 'assets/images'}

      }
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      AWSKEY: JSON.stringify(process.env.AWSKEY || ""),
      AWSSECRET: JSON.stringify(process.env.AWSSECRET || ""),
      UPLOADS: process.env.UPLOADS || false,
      LICENSE: process.env.OCR_LICENSE || "",
    }),
  ],
};

module.exports = config;
