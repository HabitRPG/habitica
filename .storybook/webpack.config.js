const baseWebpackConfig = require('../webpack/webpack.dev.conf');

module.exports = async ({ config, mode }) => {
  config.resolve.alias = {...config.resolve.alias, ...baseWebpackConfig.resolve.alias};
  config.module.rules = [
    ...baseWebpackConfig.module.rules,
    {
      test: /\.pug$/,
      loader: 'pug-plain-loader'
    }
  ];

  // Return the altered config
  return config;
};
