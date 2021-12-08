const { Builder, By, Key, until } = require('selenium-webdriver');
const { SeleniumServer } = require('selenium-webdriver/remote');
const { waitFunction, navigatePage, getUrl, deleteElement } = require('../util/util');
const { getHealth } = require('../util/common.js');
const assert = require('assert');

/**
 * Here we add health, GP to set up for other tests
 * using the debug panel functionality
 */
var runDebugSetupTests = function(driver) {
  describe('Testing debug Menu, also setting up for subsequent tests', function() {
    beforeEach(async function () {
      navigatePage(driver, getUrl(''));
      await waitFunction(200);
    });
    it('Health test', async function() {
      let debugButton = await driver.findElement(By.xpath(
        "//button[contains(text(), 'Toggle Debug Menu')]"
      ));
      await debugButton.click();
      let debugGroup = await driver.findElement(
        By.className('debug-group')
      );
      let health1Button = await driver.findElement(By.xpath(
        "//a[contains(text(), 'Health = 1')]"
      ));
      await health1Button.click();
      let healButton = await driver.findElement(By.xpath(
        "//a[contains(text(), '+ 10HP')]"
      ));
      for (let i = 0; i < 5; i++) {
        await healButton.click();
      }
      // Should find health display div first
      // Check health here
      let currHealth = await getHealth(driver);
      assert.equal(currHealth, 51, 'Should be 51 HP');
    })
    it('Testing add GP', async function() {
      let goldElement = await driver.findElement(
        By.xpath("//div[@class='item-with-icon gold']/descendant::span")
      );
      let prevAmount = await goldElement.getText();
      prevAmount = parseInt(prevAmount);
      let addGoldBtn = await driver.findElement(
        By.xpath("//a[contains(text(), '+500GP')]")
      );
      await addGoldBtn.click();
      await waitFunction(500);
      let currGold = await driver.findElement(
        By.xpath("//div[@class='item-with-icon gold']/descendant::span")
      );
      let currAmount = await currGold.getText();
      currAmount = parseInt(currAmount);
      assert.equal(currAmount, prevAmount + 500);
    })
    it('Testing add gems', async function() {
      let gemsElement = await driver.findElement(
        By.xpath("//a[@class='top-menu-icon svg-icon gem']" +
          "/following-sibling::span")
      );
      let prevGems = parseInt(await gemsElement.getText());
      let addGemsBtn = await driver.findElement(
        By.xpath("//a[contains(text(), '+10 Gems')]")
      );
      await addGemsBtn.click();
      await waitFunction(500);
      gemsElement = await driver.findElement(
        By.xpath("//a[@class='top-menu-icon svg-icon gem']" +
          "/following-sibling::span")
      );
      let currGems = parseInt(await gemsElement.getText());
      assert.equal(currGems, prevGems + 10);
      // remove the notifications elements to avoid overlaps
      deleteElement(driver, 'animations-holder');
    });
  })
}

module.exports = {
  runDebugSetupTests: runDebugSetupTests
}