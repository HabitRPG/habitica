/* eslint-disable no-process-env, no-console */

const path = require('path');
const config = require('./config');
const utils = require('./utils');
const projectRoot = path.resolve(__dirname, '../');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const postcssEasyImport = require('postcss-easy-import');
const IS_PROD = process.env.NODE_ENV === 'production';

const baseConfig = {
  entry: {
    app: './website/client/main.js',
  },
  output: {
    path: config.build.assetsRoot,
    publicPath: IS_PROD ? config.build.assetsPublicPath : config.dev.assetsPublicPath,
    filename: '[name].js',
  },
  resolve: {
    extensions: ['*', '.js', '.vue', '.json'],
    modules: [
      path.join(__dirname, '..', 'website'),
      path.join(__dirname, '..', 'test/client/unit'),
      path.join(__dirname, '..', 'node_modules'),
    ],
    alias: {
      jquery: 'jquery/src/jquery',
      website: path.resolve(__dirname, '../website'),
      common: path.resolve(__dirname, '../website/common'),
      client: path.resolve(__dirname, '../website/client'),
      assets: path.resolve(__dirname, '../website/client/assets'),
      components: path.resolve(__dirname, '../website/client/components'),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: utils.cssLoaders({
            sourceMap: IS_PROD ?
              config.build.productionSourceMap :
              config.dev.cssSourceMap,
            extract: IS_PROD,
          }),
          postcss: [
            autoprefixer({
              browsers: ['last 2 versions'],
            }),
            postcssEasyImport(),
          ],
        },
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: projectRoot,
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]'),
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]'),
        },
      },
    ],
  },
};

if (!IS_PROD) {
  const eslintFriendlyFormatter = require('eslint-friendly-formatter'); // eslint-disable-line global-require

  baseConfig.module.rules.unshift({
    test: /\.(js|vue)$/,
    loader: 'eslint-loader',
    enforce: 'pre',
    include: projectRoot,
    options: {
      formatter: eslintFriendlyFormatter,
      emitWarning: true,
    },
    exclude: /node_modules/,
  });
}
module.exports = baseConfig;