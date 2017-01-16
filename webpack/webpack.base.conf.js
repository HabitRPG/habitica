/* eslint-disable no-process-env, no-console */

const path = require('path');
const config = require('./config');
const utils = require('./utils');
const projectRoot = path.resolve(__dirname, '../');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const postcssEasyImport = require('postcss-easy-import');
const IS_PROD = process.env.NODE_ENV === 'production';
const eslintFriendlyFormatter = require('eslint-friendly-formatter');

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
    extensions: ['', '.js', '.vue'],
    fallback: [path.join(__dirname, '../node_modules')],
    alias: {
      jquery: 'jquery/src/jquery',
      website: path.resolve(__dirname, '../website'),
      common: path.resolve(__dirname, '../website/common'),
      client: path.resolve(__dirname, '../website/client'),
      assets: path.resolve(__dirname, '../website/client/assets'),
      components: path.resolve(__dirname, '../website/client/components'),
    },
  },
  resolveLoader: {
    fallback: [path.join(__dirname, '../node_modules')],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ],
  module: {
    preLoaders: !IS_PROD ? [
      {
        test: /\.vue$/,
        loader: 'eslint',
        include: projectRoot,
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        loader: 'eslint',
        include: projectRoot,
        exclude: /node_modules/,
      },
    ] : [],
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue',
      },
      {
        test: /\.js$/,
        loader: 'babel',
        include: projectRoot,
        exclude: /node_modules/,
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]'),
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]'),
        },
      },
    ],
  },
  vue: {
    loaders: utils.cssLoaders(),
    postcss: [
      autoprefixer({
        browsers: ['last 2 versions'],
      }),
      postcssEasyImport({
        glob: true,
      }),
    ],
  },
};

if (!IS_PROD) {
  baseConfig.eslint = {
    formatter: eslintFriendlyFormatter,
    emitWarning: true,
  };
}
module.exports = baseConfig;