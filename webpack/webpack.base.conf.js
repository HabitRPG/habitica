/* eslint-disable no-process-env, no-console */

const path = require('path');
const config = require('./config');
const utils = require('./utils');
const webpack = require('webpack');
const projectRoot = path.resolve(__dirname, '../');
const autoprefixer = require('autoprefixer');
const postcssEasyImport = require('postcss-easy-import');
const IS_PROD = process.env.NODE_ENV === 'production';

const baseConfig = {
  entry: {
    app: ['babel-polyfill', './website/client/main.js'],
  },
  output: {
    path: config.build.assetsRoot,
    publicPath: IS_PROD ? config.build.assetsPublicPath : config.dev.assetsPublicPath,
    filename: '[name].js',
    devtoolModuleFilenameTemplate (info) {
      // Fix source maps, code from
      // https://github.com/Darkside73/bbsmile.com.ua/commit/3596d3c42ef91b69d8380359c3e8908edc08acdb
      let filename = info.resourcePath;
      if (info.resource.match(/\.vue$/) && !info.allLoaders.match(/type=script/)) {
        filename = 'generated';
      }

      return filename;
    },
  },
  resolve: {
    extensions: ['*', '.js', '.vue', '.json'],
    modules: [
      path.join(projectRoot, 'website'),
      path.join(projectRoot, 'test/client/unit'),
      path.join(projectRoot, 'node_modules'),
    ],
    alias: {
      website: path.resolve(projectRoot, 'website'),
      common: path.resolve(projectRoot, 'website/common'),
      client: path.resolve(projectRoot, 'website/client'),
      assets: path.resolve(projectRoot, 'website/client/assets'),
      components: path.resolve(projectRoot, 'website/client/components'),
    },
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(NOT_EXISTING)$/),
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
        include: [
          path.join(projectRoot, 'test'),
          path.join(projectRoot, 'website'),
          path.join(projectRoot, 'node_modules', 'bootstrap-vue'),
        ],
        options: {
          cacheDirectory: true,
        },
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: utils.assetsPath('images/[name].[hash:7].[ext]'),
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
      {
        test: /\.svg$/,
        use: [
          { loader: 'svg-inline-loader' },
          { loader: 'svgo-loader' },
        ],
        exclude: [path.resolve(projectRoot, 'website/client/assets/svg/for-css')],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              limit: 10000,
              name: utils.assetsPath('svg/[name].[hash:7].[ext]'),
            },
          },
          { loader: 'svgo-loader' },
        ],
        include: [path.resolve(projectRoot, 'website/client/assets/svg/for-css')],
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