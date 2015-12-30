import fs from 'fs';
import path from 'path';
import express from 'express';
import _ from 'lodash';

const CONTROLLERS_PATH = path.join(__dirname, '/../../controllers/api-v3/');
let router = express.Router(); // eslint-disable-line babel/new-cap

// Wrapper function to handler `async` route handlers that return promises
// It takes the async function, execute it and pass any error to next (args[2])
let _wrapAsyncFn = fn => (...args) => fn(...args).catch(args[2]);

fs
  .readdirSync(CONTROLLERS_PATH)
  .filter(fileName => fileName.match(/\.js$/))
  .filter(fileName => fs.statSync(CONTROLLERS_PATH + fileName).isFile())
  .forEach((fileName) => {
    let controller = require(CONTROLLERS_PATH + fileName); // eslint-disable-line global-require

    _.each(controller, (action) => {
      let {method, url, middlewares = [], handler} = action;

      method = method.toLowerCase();
      router[method](url, ...middlewares, _wrapAsyncFn(handler));
    });
  });

export default router;
