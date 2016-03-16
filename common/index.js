var pathToCommon;

if (process.env.NODE_ENV === 'production') {
  pathToCommon = './transpiled-babel/index';
} else {
  pathToCommon = './script/index';
}

module.exports = require(pathToCommon);
