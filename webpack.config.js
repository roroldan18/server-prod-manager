const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  name: 'express-server',
  entry: './src/index.ts',
  target: 'node',
  mode: 'production',
  externals: [ nodeExternals() ],
  output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
  },
  resolve: {
      extensions: ['.ts', '.tsx','.js']
  },
  module: {
      rules: [
          {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: {
              loader: 'babel-loader'
          }
        },
        {
          test: /\.(ts)$/,
          use: {
              loader: 'ts-loader',
          }
      }
  ]
  },
  plugins: [
    new CleanWebpackPlugin(),
],
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin(),
    ],
  }
}
