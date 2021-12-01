const { Builder, By, Key, until } = require('selenium-webdriver');
const { SeleniumServer } = require('selenium-webdriver/remote');
const { navigatePage, waitFunction, clickByLocation } = require('../util/util');
const assert = require('assert');

var runChallengeTests = async function(driver) {
  describe('Challenge tests in challengeTest.js', function() {
    this.timeout(10000);
    beforeEach(async function () {
      navigatePage(driver, 'http://localhost:8080/challenges/findChallenges');
      await waitFunction(1000);
    });
    it('Testing challenges', async function() {

    })
  })
}

module.exports = {
  runChallengeTests: runChallengeTests
}