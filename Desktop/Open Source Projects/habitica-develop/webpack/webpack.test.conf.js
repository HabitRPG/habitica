// This is the webpack config used for unit tests.
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.conf');
const utils = require('./utils');
const webpack = require('webpack');
const testEnv = require('./config/test.env');

const webpackConfig = merge(baseConfig, {
  // use inline sourcemap for karma-sourcemap-loader
  module: {
    rules: utils.styleLoaders(),
  },
  devtool: '#inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': testEnv,
    }),
  ],
});

// no need for app entry during tests
delete webpackConfig.entry;

module.exports = webpackConfig;
