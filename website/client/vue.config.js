const path = require('path');
const webpack = require('webpack');
const nconf = require('nconf');
const setupNconf = require('../../website/server/libs/setupNconf');
const { DuplicatesPlugin } = require("inspectpack/plugin");
const pkg = require('../../package.json');

let configFile = path.join(path.resolve(__dirname, '../../config.json'));

// TODO abstract from server
setupNconf(configFile);

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
  'FACEBOOK_KEY',
  'GOOGLE_CLIENT_ID',
  'AMPLITUDE_KEY',
  'LOGGLY_CLIENT_TOKEN',
  // TODO necessary? if yes how not to mess up with vue cli? 'NODE_ENV'
];

const envObject = {};

envVars
  .forEach(key => {
    envObject[key] = nconf.get(key);
  });

module.exports = {
  configureWebpack: {
    plugins: [
      new DuplicatesPlugin({
        verbose: true
      }),
      new webpack.EnvironmentPlugin(envObject),
      new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /^\.\/(NOT_EXISTING)$/),
    ],
  },
  chainWebpack: config => {
    const pugRule = config.module.rule('pug')
    const svgRule = config.module.rule('svg')

    // clear all existing loaders.
    // if you don't do this, the loader below will be appended to
    // existing loaders of the rule.
    pugRule.uses.clear();
    svgRule.uses.clear();

    // add replacement loader(s)
    pugRule
      .test(/\.pug$/)
      // this applies to <template lang="pug"> in Vue components
      .oneOf('vue-loader')
        .resourceQuery(/^\?vue/)
        .use('pug-plain')
          .loader('pug-plain-loader')
          .end()
      .end();


    // clear all existing loaders.
    // if you don't do this, the loader below will be appended to
    // existing loaders of the rule.

    svgRule
      .test(/\.svg$/)
      .oneOf('normal')
        .exclude
          .add(path.resolve(__dirname, 'src/assets/svg/for-css'))
          .end()
        .use('svg-ingline-loader')
          .loader('svg-inline-loader')
          .end()
        .use('svgo-loader')
          .loader('svgo-loader')
          .options({
            plugins: [
              {removeViewBox: false},
              {convertPathData: {noSpaceAfterFlags: false}},
            ],
          })
          .end()
        .end()
      .oneOf('in-css')
        .include
          .add(path.resolve(__dirname, 'src/assets/svg/for-css'))
          .end()
        .use('svg-in-css')
          .loader('svg-url-loader')
          .options({
            limit: 10000,
          })
          .end()
        .use('svgo-loader')
          .loader('svgo-loader')
          .options({
            plugins: [
              {removeViewBox: false},
              {convertPathData: {noSpaceAfterFlags: false}},
            ],
          });
  },

  devServer: {
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
    }
  }
};
