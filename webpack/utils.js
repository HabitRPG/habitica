/* eslint-disable no-process-env, no-console */

const path = require('path');
const config = require('./config');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

exports.assetsPath = (_path) => {
  const assetsSubDirectory = process.env.NODE_ENV === 'production' ?
    config.build.assetsSubDirectory :
    config.dev.assetsSubDirectory;
  return path.posix.join(assetsSubDirectory, _path);
};

exports.cssLoaders = function cssLoaders (options) {
  options = options || {};
  // generate loader string to be used with extract text plugin
  function generateLoaders (loaders) {
    let sourceLoader = loaders.map((loader) => {
      let extraParamChar;
      if (/\?/.test(loader)) {
        loader = loader.replace(/\?/, '-loader?');
        extraParamChar = '&';
      } else {
        loader = `${loader}-loader`;
        extraParamChar = '?';
      }
      return loader + (options.sourceMap ? `${extraParamChar}sourceMap` : '');
    }).join('!');

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: sourceLoader,
        fallback: 'vue-style-loader',
      });
    } else {
      return ['vue-style-loader', sourceLoader].join('!');
    }
  }

  // http://vuejs.github.io/vue-loader/en/configurations/extract-css.html
  return {
    css: generateLoaders(['css']),
    postcss: generateLoaders(['css']),
    less: generateLoaders(['css', 'less']),
    sass: generateLoaders(['css', 'sass?indentedSyntax']),
    scss: generateLoaders(['css', 'sass']),
    stylus: generateLoaders(['css', 'stylus']),
    styl: generateLoaders(['css', 'stylus']),
  };
};

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = (options) => {
  const output = [];
  const loaders = exports.cssLoaders(options);
  for (let extension in loaders) {
    const loader = loaders[extension];
    output.push({
      test: new RegExp(`\\.${extension}$`),
      loader,
    });
  }
  return output;
};
