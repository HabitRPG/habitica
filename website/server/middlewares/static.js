import express from 'express';
import nconf from 'nconf';
import path from 'path';

const IS_PROD = nconf.get('IS_PROD');
const IS_NEW_CLIENT_ENABLED = nconf.get('NEW_CLIENT_ENABLED') === 'true';
const MAX_AGE = IS_PROD ? 31536000000 : 0;
const ASSETS_DIR = path.join(__dirname, '/../../assets');
const PUBLIC_DIR = path.join(__dirname, '/../../client-old');
const BUILD_DIR = path.join(__dirname, '/../../build');

module.exports = function staticMiddleware (expressApp) {
  // Expose static files for new client
  if (IS_PROD && IS_NEW_CLIENT_ENABLED) {
    expressApp.use('/new-app/static', express.static(`${PUBLIC_DIR}/../../dist-client/static`));
  }

  // TODO move all static files to a single location (one for public and one for build)
  expressApp.use(express.static(BUILD_DIR, { maxAge: MAX_AGE }));
  // TODO figure out better way to set up sprites assets
  expressApp.use(express.static(`${ASSETS_DIR}/sprites/dist`, { maxAge: MAX_AGE }));
  // so we have access to the gif sprites
  expressApp.use(express.static(`${ASSETS_DIR}/sprites/backer-only/`, { maxAge: MAX_AGE }));
  expressApp.use(express.static(`${ASSETS_DIR}/sprites/`, { maxAge: MAX_AGE }));

  expressApp.use('/assets/audio', express.static(`${ASSETS_DIR}/audio`, { maxAge: MAX_AGE }));
  expressApp.use('/assets/img', express.static(`${PUBLIC_DIR}/../../website/assets/img`, { maxAge: MAX_AGE }));
  expressApp.use(express.static(PUBLIC_DIR));
};
