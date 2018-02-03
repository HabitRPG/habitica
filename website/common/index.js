'use strict';

let pathToCommon;

if (process.env.NODE_ENV === 'production') { // eslint-disable-line no-process-env
  pathToCommon = './transpiled-babel/index';
} else {
  pathToCommon = './script/index';
}

module.exports = require(pathToCommon);
