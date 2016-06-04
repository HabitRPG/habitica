'use strict';

const chalk = require('chalk');

const logger = {
  info: loggerGenerator('info', 'cyan'),
  success: loggerGenerator('info', 'green'),
  error: loggerGenerator('error', 'red'),
  log: loggerGenerator('log', 'white'),
  warn: loggerGenerator('warn', 'yellow'),
};

function loggerGenerator (type, color) {
  return function () {
    let args = Array.from(arguments).map(arg => chalk[color](arg));
    console[type].apply(null, args);
  }
}

module.exports = logger;
