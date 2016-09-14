import express from 'express';
import nconf from 'nconf';
import path from 'path';

const IS_PROD = nconf.get('IS_PROD');
const MAX_AGE = IS_PROD ? 31536000000 : 0;
const ASSETS_DIR = path.join(__dirname, '/../../assets');
const PUBLIC_DIR = path.join(__dirname, '/../../client-old');
const BUILD_DIR = path.join(__dirname, '/../../build');

module.exports = function staticMiddleware (expressApp) {
  // TODO move all static files to a single location (one for public and one for build)
  expressApp.use(express.static(BUILD_DIR, { maxAge: MAX_AGE }));
  expressApp.use('/common/dist', express.static(`${PUBLIC_DIR}/../../common/dist`, { maxAge: MAX_AGE }));
  expressApp.use('/assets/audio', express.static(`${ASSETS_DIR}/audio`, { maxAge: MAX_AGE }));
  expressApp.use('/assets/sprites', express.static(`${ASSETS_DIR}/sprites/dist`, { maxAge: MAX_AGE }));
  expressApp.use('/common/img', express.static(`${PUBLIC_DIR}/../../common/img`, { maxAge: MAX_AGE }));
  expressApp.use(express.static(PUBLIC_DIR));

  // Expose new client when not in production
  if (!IS_PROD) expressApp.use('/new-app', express.static(`${PUBLIC_DIR}/../client`));
};
