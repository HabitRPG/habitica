require('babel-register');

// This file must use ES5, everything required can be in ES6

function setUpServer () {
  const nconf = require('nconf'); // eslint-disable-line global-require, no-unused-vars
  const mongoose = require('mongoose'); // eslint-disable-line global-require, no-unused-vars
  const setupNconf = require('../website/server/libs/setupNconf'); // eslint-disable-line global-require

  setupNconf();

  // We require src/server and npt src/index because
  // 1. nconf is already setup
  // 2. we don't need clustering
  require('../website/server/server'); // eslint-disable-line global-require
}
setUpServer();

// Replace this with your migration
const processUsers = require('./groups/reconcile-group-plan-members.js');
processUsers();
