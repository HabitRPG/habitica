import fs from 'fs';
import _ from 'lodash';
import {
  getUserLanguage,
} from '../middlewares/language';

// Wrapper function to handler `async` route handlers that return promises
// It takes the async function, execute it and pass any error to next (args[2])
let _wrapAsyncFn = fn => (...args) => fn(...args).catch(args[2]);
let noop = (req, res, next) =>  next();

module.exports.readController = function readController (router, controller) {
  _.each(controller, (action) => {
    let {method, url, middlewares = [], handler} = action;

    // If an authentication middleware is used run getUserLanguage after it, otherwise before
    // for cron instead use it only if an authentication middleware is present
    let authMiddlewareIndex = _.findIndex(middlewares, middleware => {
      if (middleware.name.indexOf('authWith') === 0) { // authWith{Headers|Session|Url|...}
        return true;
      } else {
        return false;
      }
    });

    let middlewaresToAdd = [getUserLanguage];

    if (action.noLanguage !== true) {
      if (authMiddlewareIndex !== -1) { // the user will be authenticated, getUserLanguage after authentication
        if (authMiddlewareIndex === middlewares.length - 1) {
          middlewares.push(...middlewaresToAdd);
        } else {
          middlewares.splice(authMiddlewareIndex + 1, 0, ...middlewaresToAdd);
        }
      } else { // no auth, getUserLanguage as the first middleware
        middlewares.unshift(...middlewaresToAdd);
      }
    }

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
