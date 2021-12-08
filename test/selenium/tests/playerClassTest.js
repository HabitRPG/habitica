const { Builder, By, Key, until } = require('selenium-webdriver');
const { SeleniumServer } = require('selenium-webdriver/remote');
const { waitFunction, getUrl, navigatePage } = require('../util/util');
const { isManaEnabled } = require('../util/common.js');
const assert = require('assert');

/**
 * Test somme class change related functionality.
 * Currently tests mana acquisition up opting in as warrior.
 * User needs to be opted in as warrior, at least level 10,
 * and have mana as a result of opting in
 */
var runPlayerClassTests = async function(driver) {
  describe('Running tests on tavern chat', function() {
    this.timeout(10000);
    beforeEach(async function() {
      navigatePage(driver, getUrl('user/settings/site'));
      await waitFunction(2000);
    })
    it('Testing class change - opt out', async function() {
      let changeClassBtn = await driver.findElement(
        By.xpath(
          "//button[contains(text(), 'Change Class')]"
      ));
      await changeClassBtn.click();
      await waitFunction(200);
      let alert = await driver.switchTo().alert();
      await alert.accept();
      await waitFunction(500);

      let optOut = await driver.findElement(
        By.css('#classOptOutBtn')
      );
      await optOut.click();
      await waitFunction(500);
      let hasMana = await isManaEnabled(driver);
      assert.equal(hasMana, false);
    })
    it('Testing class change - opt in warrior', async function() {
      let changeClassBtn = await driver.findElement(
        By.xpath(
          "//button[contains(text(), 'Enable Class System')]"
      ));
      await changeClassBtn.click();
      await waitFunction(500);

      let optOut = await driver.findElement(
        By.xpath(
          "//button[contains(text(), 'Select Warrior')]"
      ));
      await optOut.click();
      await waitFunction(500);
      let hasMana = await isManaEnabled(driver);
      assert.equal(hasMana, true);
    })
  })
};

module.exports = {
  runPlayerClassTests: runPlayerClassTests
}