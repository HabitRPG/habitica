
const chalk = require('chalk');

function loggerGenerator (type, color) {
  return function logger () {
    const args = Array.from(arguments).map(arg => chalk[color](arg));
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
