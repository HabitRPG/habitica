import express from 'express';
import nconf from 'nconf';
import path from 'path';

const IS_PROD = nconf.get('IS_PROD');
const ONE_YEAR = IS_PROD ? 31536000000 : 0;
const ONE_WEEK = IS_PROD ? 604800000 : 0;
const BASE_DIR = path.join(__dirname, '/../../..');

// @TODO refactor so every file is hashed
export default function staticMiddleware (expressApp) {
  /* Expose static files for the client
     These files are processed by Webpack and the filenames are hashed
     This allows them to be cached for one year since the filename changes in case the file changes.
  */
  expressApp.use('/static/js', express.static(`${BASE_DIR}/website/client/dist/static/js`, { maxAge: ONE_YEAR }));
  expressApp.use('/static/css', express.static(`${BASE_DIR}/website/client/dist/static/css`, { maxAge: ONE_YEAR }));
  expressApp.use('/static/svg', express.static(`${BASE_DIR}/website/client/dist/static/svg`, { maxAge: ONE_YEAR }));
  expressApp.use('/static/img', express.static(`${BASE_DIR}/website/client/dist/static/img`, { maxAge: ONE_YEAR }));

  /* Expose other static files (audio, emails images, ...)
     These files are not processed by Webpack but they change very rarely.
     So we still cache them for 1 week.
  */
  expressApp.use('/static/audio', express.static(`${BASE_DIR}/website/client/dist/static/audio`, { maxAge: ONE_WEEK }));
  expressApp.use('/static/emails', express.static(`${BASE_DIR}/website/client/dist/static/emails`, { maxAge: ONE_WEEK }));
  expressApp.use('/static/icons', express.static(`${BASE_DIR}/website/client/dist/static/icons`, { maxAge: ONE_WEEK }));
  expressApp.use('/static/merch', express.static(`${BASE_DIR}/website/client/dist/static/merch`, { maxAge: ONE_WEEK }));
  expressApp.use('/static/presskit', express.static(`${BASE_DIR}/website/client/dist/static/presskit`, { maxAge: ONE_WEEK }));
  expressApp.use('/static/npc', express.static(`${BASE_DIR}/website/client/dist/static/npc`, { maxAge: ONE_WEEK }));

  /* The remaining files are not cached yet. */
  expressApp.use('/static', express.static(`${BASE_DIR}/website/client/dist/static`));

  /* Storybook files, not cached yet. */
  expressApp.use('/storybook', express.static(`${BASE_DIR}/website/client/dist/storybook`));

  /* APIdoc files, not cached yet. */
  expressApp.use('/apidoc', express.static(`${BASE_DIR}/apidoc/html`));
}
