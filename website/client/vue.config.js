/* eslint-disable import/no-commonjs */
const path = require('path');
const webpack = require('webpack');
const nconf = require('nconf');
const { DuplicatesPlugin } = require('inspectpack/plugin');
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
  // TODO necessary? if yes how not to mess up with vue cli? 'NODE_ENV'
];

const envObject = {};

envVars
  .forEach(key => {
    envObject[key] = nconf.get(key);
  });

const enableDuplicatesPlugin = process.env.npm_lifecycle_event !== 'storybook:serve';

const webpackPlugins = [
  new webpack.EnvironmentPlugin(envObject),
  new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /^\.\/(NOT_EXISTING)$/),
];

if (enableDuplicatesPlugin) {
  webpackPlugins.splice(0, 0, new DuplicatesPlugin({
    verbose: true,
  }));
}

module.exports = {
  assetsDir: 'static',
  configureWebpack: {
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

    const svgRule = config.module.rule('svg');

    // clear all existing loaders.
    // if you don't do this, the loader below will be appended to
    // existing loaders of the rule.
    svgRule.uses.clear();

    // add replacement loader(s)
    svgRule
      .test(/\.svg$/)
      .oneOf('normal')
      .exclude
      .add(path.resolve(__dirname, 'src/assets/svg/for-css'))
      .end()
      .use('svg-inline-loader')
      .loader('svg-inline-loader')
      .end()
      .use('svgo-loader')
      .loader('svgo-loader')
      .options({
        plugins: [
          { removeViewBox: false },
          { convertPathData: { noSpaceAfterFlags: false } },
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
        limit: 4000,
        name: 'static/svg/[contenthash].[ext]',
      })
      .end()
      .use('svgo-loader')
      .loader('svgo-loader')
      .options({
        plugins: [
          { removeViewBox: false },
          { convertPathData: { noSpaceAfterFlags: false } },
        ],
      });

    // Disable eslint warnings when running the server
    config.module
      .rule('eslint')
      .use('eslint-loader')
      .loader('eslint-loader')
      .tap(options => {
        options.quiet = true;
        return options;
      });

    // Fix issue with Safari cache, see https://github.com/vuejs/vue-cli/issues/2509
    if (process.env.NODE_ENV === 'development') {
      config.plugins.delete('preload');
    }
  },

  devServer: {
    headers: { 'Cache-Control': 'no-store' },
    disableHostCheck: true,
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
