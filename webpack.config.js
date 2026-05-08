const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    app: ['core-js/stable', 'regenerator-runtime/runtime', './examples/Router/index.js'],
  },
  stats: 'errors-warnings',
  context: __dirname,
  output: {
    filename: 'bundle.js',
  },
  devtool: 'source-map',
  devServer: {
    static: { directory: path.resolve(__dirname) },
    allowedHosts: 'all',
    host: 'localhost',
    hot: true,
    port: process.env.PORT || 5050,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
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
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ],
};
