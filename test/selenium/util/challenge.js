const { Builder, By, Key, until } = require('selenium-webdriver');
const { URL } = require('../config/config.js');
const { generateMessage } = require('./util.js');

var challengeMessage = function() {
  return 'Challenge ' + generateMessage();
}

var taskMessage = function() {
  return 'Challenge Task ' + generateMessage();
}

module.exports = {
  challengeMessage: challengeMessage,
  taskMessage: taskMessage
}