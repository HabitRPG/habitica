import express from 'express';
import nconf from 'nconf';
import path from 'path';

const IS_PROD = nconf.get('IS_PROD');
const MAX_AGE = IS_PROD ? 31536000000 : 0;
const BASE_DIR = path.join(__dirname, '/../../..');

module.exports = function staticMiddleware (expressApp) {
  // Expose static files for new client
  expressApp.use('/static/js', express.static(`${BASE_DIR}/dist-client/static/js`, { maxAge: MAX_AGE }));
  expressApp.use('/static/css', express.static(`${BASE_DIR}/dist-client/static/css`, { maxAge: MAX_AGE }));
  expressApp.use('/static/img', express.static(`${BASE_DIR}/dist-client/static/img`, { maxAge: MAX_AGE }));

  // @TODO img/js/css under /static have their names hashed after every change so they can be cached
  // Not files in /audio and /sprites, that's why we don't cache them.
  // Hash their file names and cache the entire /static folder
  expressApp.use('/static', express.static(`${BASE_DIR}/dist-client/static`));


  // @TODO all these paths are not used by the new client, remove them
  // But first check that they're not used anywhere else
  // In particular the images used by emails
};
