const webpack = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  entry: {
    app: ['core-js/stable', 'regenerator-runtime/runtime', './examples/Router/index.js'],
  },
  stats: 'verbose',
  context: __dirname,
  output: {
    filename: 'bundle.js',
  },
  devtool: 'source-map',
  resolve: {
    mainFields: ['browser', 'module', 'main'],
  },
  devServer: {
    allowedHosts: 'all',
    host: 'localhost',
    hot: true,
    port: process.env.PORT || 5050,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new ESLintPlugin({ extensions: ['js', 'jsx'] }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
};
