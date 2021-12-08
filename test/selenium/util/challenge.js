const { Builder, By, Key, until } = require('selenium-webdriver');
const { URL } = require('../config/config.js');
const { generateMessage } = require('./util.js');

const challengeMessage = function() {
  return 'Challenge ' + generateMessage();
}

const taskMessage = function() {
  return 'Challenge Task ' + generateMessage();
}

module.exports = {
  challengeMessage: challengeMessage,
  taskMessage: taskMessage
}