require("babel-register");
require("babel-polyfill");

// This file must use ES5, everything required can be in ES6

function setUpServer () {
  var nconf = require('nconf');
  var mongoose = require('mongoose');
  var Bluebird = require('bluebird');
  var setupNconf = require('../website/server/libs/setupNconf');
  setupNconf();
  // We require src/server and npt src/index because
  // 1. nconf is already setup
  // 2. we don't need clustering
  require('../website/server/server'); // eslint-disable-line global-require
}
setUpServer();

// Replace this with your migration
const processUsers = require('./tasks/tasks-set-everyX');
processUsers();
