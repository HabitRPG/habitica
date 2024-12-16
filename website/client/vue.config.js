/* eslint-disable import/no-commonjs */
const path = require('path');
const webpack = require('webpack');
const nconf = require('nconf');
const vueTemplateCompiler = require('vue-template-babel-compiler');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const setupNconf = require('../server/libs/setupNconf');
const pkg = require('./package.json');

const configFile = path.join(path.resolve(__dirname, '../../config.json'));

// TODO abstract from server
setupNconf(configFile, nconf);

const DEV_BASE_URL = nconf.get('BASE_URL');

const envVars = [
  'AMAZON_PAYMENTS_SELLER_ID',
  'AMAZON_PAYMENTS_CLIENT_ID',
  'AMAZON_PAYMENTS_MODE',
  'EMAILS_COMMUNITY_MANAGER_EMAIL',
  'EMAILS_TECH_ASSISTANCE_EMAIL',
  'EMAILS_PRESS_ENQUIRY_EMAIL',
  'BASE_URL',
  'GA_ID',
  'STRIPE_PUB_KEY',
  'GOOGLE_CLIENT_ID',
  'APPLE_AUTH_CLIENT_ID',
  'AMPLITUDE_KEY',
  'LOGGLY_CLIENT_TOKEN',
  'TRUSTED_DOMAINS',
  'TIME_TRAVEL_ENABLED',
  'DEBUG_ENABLED',
  'CONTENT_SWITCHOVER_TIME_OFFSET',
  // TODO necessary? if yes how not to mess up with vue cli? 'NODE_ENV'
];

const envObject = {};

envVars
  .forEach(key => {
    envObject[`process.env.${key}`] = `'${nconf.get(key)}'`;
  });

const webpackPlugins = [
  new webpack.DefinePlugin(envObject),
  new MomentLocalesPlugin({
    localesToKeep: ['bg',
      'cs',
      'da',
      'de',
      'en',
      'es',
      'fr',
      'he',
      'hu',
      'id',
      'it',
      'ja',
      'nl',
      'pl',
      'pt',
      'pt-br',
      'ro',
      'ru',
      'sk',
      'sv',
      'tr',
      'uk',
      'zh-cn',
      'zh-tw',
    ],
  }),
  new webpack.IgnorePlugin({
    checkResource (resource, context) {
      if ((context.includes('sinon') || resource.includes('sinon') || context.includes('nise')) && nconf.get('TIME_TRAVEL_ENABLED') !== 'true') {
        return true;
      }
      if (context.includes('yargs')) {
        return true;
      }
      return false;
    },
  }),
];

module.exports = {
  assetsDir: 'static',
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.svg/,
          dependency: { not: ['url'] },
          type: 'asset/source',
        },
        {
          test: /\.js$/,
          // Exclude transpiling `node_modules`, except `bootstrap-vue/src`
          exclude: /node_modules\/(?!bootstrap-vue\/src\/)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.js$/,
          // Exclude transpiling `node_modules`, except `bootstrap-vue/src`
          exclude: /node_modules\/(?!validator)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
      ],
    },
    resolve: {
      fallback: {
        crypto: false,
        fs: false,
        os: false,
        path: false,
        stream: false,
        timers: require.resolve('timers-browserify'),
      },
      alias: {
        // Alias for using source of BootstrapVue
        'bootstrap-vue$': 'bootstrap-vue/src/index.js',
      },
    },
    plugins: webpackPlugins,
  },
  chainWebpack: config => {
    // Fix issue with duplicated deps in monorepos
    // https://getpocket.com/redirect?url=https%3A%2F%2Fgithub.com%2Fwebpack%2Fwebpack%2Fissues%2F8886
    // Manually resolve each dependency
    Object.keys(pkg.dependencies).forEach(dep => {
      config.resolve.alias
        .set(dep, path.resolve(__dirname, `./node_modules/${dep}`));
    });

    // Fix issue with Safari cache, see https://github.com/vuejs/vue-cli/issues/2509
    if (process.env.NODE_ENV === 'development') {
      config.plugins.delete('preload');
    }

    // enable optional chaining in templates
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        options.compiler = vueTemplateCompiler;
        return options;
      });
  },

  devServer: {
    headers: { 'Cache-Control': 'no-store' },
    proxy: {
      // proxy all requests to the server at IP:PORT as specified in the top-level config
      '^/api/v3': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/api/v4': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/stripe': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/amazon': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/paypal': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/logout-server': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/export': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '^/analytics': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
    },
  },
};
