/* global env:true, rm:true, mkdir:true, cp:true */

// https://github.com/shelljs/shelljs
require('shelljs/global');

const path = require('path');
const config = require('./config');
const ora = require('ora');
const webpack = require('webpack');
const webpackConfig = require('./webpack.prod.conf');

module.exports = function webpackProductionBuild (callback) {
  env.NODE_ENV = 'production';

  console.log( // eslint-disable-line no-console
    '  Tip:\n' +
    '  Built files are meant to be served over an HTTP server.\n' +
    '  Opening index.html over file:// won\'t work.\n'
  );

  const spinner = ora('building for production...');
  spinner.start();

  const assetsPath = path.join(config.build.assetsRoot, config.build.assetsSubDirectory);
  rm('-rf', assetsPath);
  mkdir('-p', assetsPath);
  cp('-R', config.build.staticAssetsDirectory, assetsPath);

  webpack(webpackConfig, (err, stats) => {
    spinner.stop();

    const output = `${stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
    })}\n`;

    if (callback) {
      return err ? callback(err) : callback(null, output);
    } else {
      if (err) throw err;
      process.stdout.write(output);
    }
  });
};
