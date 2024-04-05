/* eslint-disable import/no-commonjs */
const path = require('path');
const webpack = require('webpack');
const nconf = require('nconf');
const vueTemplateCompiler = require('vue-template-babel-compiler');
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
  'ENABLE_TIME_TRAVEL',
  // TODO necessary? if yes how not to mess up with vue cli? 'NODE_ENV'
];

const envObject = {};

envVars
  .forEach(key => {
    envObject[`process.env.${key}`] = `'${nconf.get(key)}'`;
  });

const webpackPlugins = [
  new webpack.DefinePlugin(envObject),
  new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /^\.\/(NOT_EXISTING)$/),
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
      ],
    },
    resolve: {
      fallback: {
        timers: require.resolve('timers-browserify'),
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
