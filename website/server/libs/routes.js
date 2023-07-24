import fs from 'fs';
import _ from 'lodash';
import {
  getUserLanguage,
} from '../middlewares/language';
import {
  disableCache,
} from '../middlewares/cache';

// Wrapper function to handler `async` route handlers that return promises
// It takes the async function, execute it and pass any error to next (args[2])
const _wrapAsyncFn = fn => (...args) => fn(...args).catch(args[2]);
const noop = (req, res, next) => next();

export function readController (router, controller, overrides = []) {
  _.each(controller, action => {
    let {
      method,
    } = action;
    const { url, middlewares = [], handler } = action;

    // Allow to specify a list of routes (METHOD + URL) to skip
    if (overrides.indexOf(`${method}-${url}`) !== -1) return;

    // If an authentication middleware is used run getUserLanguage after it, otherwise before
    // for cron instead use it only if an authentication middleware is present
    let authMiddlewareIndex = _.findIndex(middlewares, middleware => {
      if (middleware.name.indexOf('authWith') === 0) { // authWith{Headers|Session|Url|...}
        return true;
      }
      return false;
    });

    method = method.toLowerCase();

    // disable caching for all routes with mandatory or optional authentication
    if (authMiddlewareIndex !== -1) {
      middlewares.unshift(disableCache);
      authMiddlewareIndex += 1;
    }

    if (action.noLanguage !== true) { // unless getting the language is explictly disabled
      // the user will be authenticated, getUserLanguage after authentication
      if (authMiddlewareIndex !== -1) {
        if (authMiddlewareIndex === middlewares.length - 1) {
          middlewares.push(getUserLanguage);
        } else {
          middlewares.splice(authMiddlewareIndex + 1, 0, getUserLanguage);
        }
      } else { // no auth, getUserLanguage as the first middleware
        middlewares.unshift(getUserLanguage);
      }
    }

    const fn = handler ? _wrapAsyncFn(handler) : noop;

    router[method](url, ...middlewares, fn);
  });
}

export function walkControllers (router, filePath, overrides) {
  fs
    .readdirSync(filePath)
    .forEach(fileName => {
      if (!fs.statSync(filePath + fileName).isFile()) {
        walkControllers(router, `${filePath}${fileName}/`, overrides);
      } else if (fileName.match(/\.js$/)) {
        const controller = require(filePath + fileName).default; // eslint-disable-line global-require, import/no-dynamic-require, max-len
        readController(router, controller, overrides);
      }
    });
}
