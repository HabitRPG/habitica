var path = require('path');
var config = require('./config');
var utils = require('./utils');
var projectRoot = path.resolve(__dirname, '../');

var IS_PROD = process.env.NODE_ENV === 'production';
var baseConfig = {
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
      client: path.resolve(__dirname, '../website/client'),
      assets: path.resolve(__dirname, '../website/client/assets'),
      components: path.resolve(__dirname, '../website/client/components'),
    },
  },
  resolveLoader: {
    fallback: [path.join(__dirname, '../node_modules')],
  },
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
      require('autoprefixer')({
        browsers: ['last 2 versions'],
      }),
    ],
  },
};

if (!IS_PROD) {
  baseConfig.eslint = {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: true,
  };
}
module.exports = baseConfig;