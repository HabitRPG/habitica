/* eslint-disable import/no-commonjs */
const chalk = require('chalk'); // eslint-disable-line import/no-extraneous-dependencies

function loggerGenerator (type, color) {
  return function logger () {
    const args = Array
      .from(arguments) // eslint-disable-line prefer-rest-params
      .map(arg => chalk[color](arg));
    console[type].apply(null, args);
  };
}

const logger = {
  info: loggerGenerator('info', 'cyan'),
  success: loggerGenerator('info', 'green'),
  error: loggerGenerator('error', 'red'),
  log: loggerGenerator('log', 'white'),
  warn: loggerGenerator('warn', 'yellow'),
};

module.exports = logger;
