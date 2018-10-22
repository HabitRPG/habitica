module.exports = {
  outputDir: 'dist-client',
  assetsDir: 'static',
  lintOnSave: false,
  configureWebpack: config => {
    config.entry = {
      // TODO babel-polyfill necessary?
      app: ['babel-polyfill', './website/client/main.js'],
    };
  },
};