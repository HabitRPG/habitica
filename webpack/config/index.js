// see http://vuejs-templates.github.io/webpack for documentation.
const path = require('path');
const staticAssetsDirectory = './website/static/.'; // The folder where static files (not processed) live
const prodEnv = require('./prod.env');
const devEnv = require('./dev.env');
const nconf = require('nconf');
const setupNconf = require('../../website/server/libs/setupNconf');

let configFile = path.join(path.resolve(__dirname, '../../config.json'));

setupNconf(configFile);

const DEV_BASE_URL = nconf.get('BASE_URL');

module.exports = {
  build: {
    env: prodEnv,
    index: path.resolve(__dirname, '../../dist-client/index.html'),
    assetsRoot: path.resolve(__dirname, '../../dist-client'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    staticAssetsDirectory,
    productionSourceMap: true,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run client:build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report, // eslint-disable-line no-process-env
  },
  dev: {
    env: devEnv,
    port: 8080,
    autoOpenBrowser: true,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    staticAssetsDirectory,
    proxyTable: {
      // proxy all requests starting with /api/v3 to IP:PORT as specified in the top-level config
      '/api/v3': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '/stripe': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '/amazon': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '/paypal': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
      '/logout': {
        target: DEV_BASE_URL,
        changeOrigin: true,
      },
    },
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false,
  },
};
