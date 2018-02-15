require('babel-register');
require('babel-polyfill');

// This file must use ES5, everything required can be in ES6

function setUpServer () {
  let nconf = require('nconf');
  let mongoose = require('mongoose');
  let Bluebird = require('bluebird');
  let setupNconf = require('../website/server/libs/setupNconf');
  setupNconf();
  // We require src/server and npt src/index because
  // 1. nconf is already setup
  // 2. we don't need clustering
  require('../website/server/server'); // eslint-disable-line global-require
}
setUpServer();

// Replace this with your migration
const processUsers = require('./20180125_clean_new_notifications.js');
processUsers();
