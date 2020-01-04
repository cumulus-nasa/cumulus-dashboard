const webpack = require('webpack');
const merge = require('webpack-merge');

const CommonConfig = require('./webpack.common');

const DevConfig = merge.smartStrategy(
  {
    devtool: 'replace',
    'module.rules.use': 'prepend'
  }
)(CommonConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    historyApiFallback: true,
    host: '0.0.0.0', // Required for Docker
    publicPath: '/',
    watchContentBase: true,
    compress: true,
    port: 5001,
    contentBase: './dist',
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [
          {
            // Creates `style` nodes from JS strings
            loader: 'style-loader',
          },
        ]
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
});

module.exports = DevConfig;