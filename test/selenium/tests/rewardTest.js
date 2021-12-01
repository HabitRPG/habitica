const { Builder, By, Key, until } = require('selenium-webdriver');
const { SeleniumServer } = require('selenium-webdriver/remote');
const { navigatePage, getUrl, waitFunction,
  checkIfElementExistsXpath, checkIfElementExistsCss, clickByLocation } = require('../util/util.js');
const { getGold, getHealth } = require('../util/common.js');
const assert = require('assert');

var runRewardTests = async function(driver) {
  describe('Now Running tests on rewardTest.js', function() {
    this.timeout(10000);
    beforeEach(async function () {
      navigatePage(driver, getUrl());
      await waitFunction(2000);
    });
    it('Reward tests', async function() {
      // Get amount of gold
      let goldElem = await driver.findElement(
        By.className("item-with-icon gold"),
        By.xpath("//div[@class='item-with-icon gold']//descendant::span")
      );
      let initialGold = Number(await goldElem.getText());

      // Click Reward
      let customReward = await driver.findElement(
        By.xpath(
          "//div[contains(@class, 'task-reward-control-bg')]"
        )
      );
      await customReward.click();

      // Recheck gold
      goldElem = await driver.findElement(
        By.className("item-with-icon gold"),
        By.xpath("//div[@class='item-with-icon gold']//descendant::span")
      );
      let currGold = Number(await goldElem.getText());
      assert.equal(currGold, initialGold - 12);
    });
    it('Testing reward potion', async function() {
      // Turn health back to 1 to test potion
      if (! (await checkIfElementExistsXpath(
        driver,
        "//a[contains(text(), 'Health = 1')]"
        ))) {
        let debugButton = await driver.findElement(By.xpath(
          "//button[contains(text(), 'Toggle Debug Menu')]"
        ));
        await debugButton.click();
      }
      let health1Button = await driver.findElement(By.xpath(
        "//a[contains(text(), 'Health = 1')]"
      ));
      await health1Button.click();

      // Now test the potion
      let goldBefore = await getGold(driver);
      let healthBefore = await getHealth(driver);
      let potionDiv = await driver.findElement(By.className('shop_potion'));
      await clickByLocation(driver, potionDiv);
      let goldAfter = await getGold(driver);
      let healthAfter = await getHealth(driver);
      assert.equal(goldAfter, goldBefore - 25);
      assert.equal(healthAfter, healthBefore + 15);

      // Revert back to full health
      if (! (await checkIfElementExistsXpath(
        driver,
        "//a[contains(text(), '+ 10HP')]"
        ))) {
        let debugButton = await driver.findElement(By.xpath(
          "//button[contains(text(), 'Toggle Debug Menu')]"
        ));
        await debugButton.click();
      }
      let addHPButton = await driver.findElement(By.xpath(
        "//a[contains(text(), '+ 10HP')]"
      ));
      for (let i = 0; i < 4; i++) {
        await addHPButton.click();
      }
    })
  });
};

module.exports = {
  runRewardTests: runRewardTests
}