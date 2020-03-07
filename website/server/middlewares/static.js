import express from 'express';
import nconf from 'nconf';
import path from 'path';

const IS_PROD = nconf.get('IS_PROD');
const MAX_AGE = IS_PROD ? 31536000000 : 0;
const BASE_DIR = path.join(__dirname, '/../../..');

export default function staticMiddleware (expressApp) {
  // Expose static files for new client
  expressApp.use('/static/js', express.static(`${BASE_DIR}/website/client/dist/static/js`, { maxAge: MAX_AGE }));
  expressApp.use('/static/css', express.static(`${BASE_DIR}/website/client/dist/static/css`, { maxAge: MAX_AGE }));
  expressApp.use('/static/svg', express.static(`${BASE_DIR}/website/client/dist/static/svg`, { maxAge: MAX_AGE }));
  expressApp.use('/static/img', express.static(`${BASE_DIR}/website/client/dist/static/img`, { maxAge: MAX_AGE }));

  // @TODO img/js/css under /static have their names hashed after every change so they can be cached
  // Not files in /audio and /sprites, that's why we don't cache them.
  // Hash their file names and cache the entire /static folder
  expressApp.use('/static', express.static(`${BASE_DIR}/website/client/dist/static`));

  // Storybook
  expressApp.use('/storybook', express.static(`${BASE_DIR}/website/client/dist/storybook`));

  // Apidoc
  expressApp.use('/apidoc', express.static(`${BASE_DIR}/apidoc_build`));
}
