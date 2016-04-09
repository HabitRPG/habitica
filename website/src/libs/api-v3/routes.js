import fs from 'fs';
import _ from 'lodash';

// Wrapper function to handler `async` route handlers that return promises
// It takes the async function, execute it and pass any error to next (args[2])
let _wrapAsyncFn = fn => (...args) => fn(...args).catch(args[2]);
let noop = (req, res, next) =>  next();

module.exports.readController = function readController (router, controller) {
  _.each(controller, (action) => {
    let {method, url, middlewares = [], handler} = action;

    method = method.toLowerCase();
    let fn = handler ? _wrapAsyncFn(handler) : noop;

    router[method](url, ...middlewares, fn);
  });
};

module.exports.walkControllers = function walkControllers (router, filePath) {
  fs
    .readdirSync(filePath)
    .forEach(fileName => {
      if (!fs.statSync(filePath + fileName).isFile()) {
        walkControllers(router, `${filePath}${fileName}/`);
      } else if (fileName.match(/\.js$/)) {
        let controller = require(filePath + fileName); // eslint-disable-line global-require
        module.exports.readController(router, controller);
      }
    });
};
