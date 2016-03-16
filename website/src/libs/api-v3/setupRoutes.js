import fs from 'fs';
import path from 'path';
import express from 'express';
import _ from 'lodash';

const CONTROLLERS_PATH = path.join(__dirname, '/../../controllers/api-v3/');
let router = express.Router(); // eslint-disable-line babel/new-cap

// Wrapper function to handler `async` route handlers that return promises
// It takes the async function, execute it and pass any error to next (args[2])
let _wrapAsyncFn = fn => (...args) => fn(...args).catch(args[2]);
let noop = (req, res, next) =>  next();

function walkControllers (filePath) {
  fs
    .readdirSync(filePath)
    .forEach(fileName => {
      if (!fs.statSync(filePath + fileName).isFile()) {
        walkControllers(`${filePath}${fileName}/`);
      } else if (fileName.match(/\.js$/)) {
        let controller = require(filePath + fileName); // eslint-disable-line global-require

        _.each(controller, (action) => {
          let {method, url, middlewares = [], handler} = action;

          method = method.toLowerCase();
          let fn = handler ? _wrapAsyncFn(handler) : noop;

          router[method](url, ...middlewares, fn);
        });
      }
    });
}

walkControllers(CONTROLLERS_PATH);

module.exports = router;
