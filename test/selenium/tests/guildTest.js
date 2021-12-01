const { Builder, By, Key, until } = require('selenium-webdriver');
const { SeleniumServer } = require('selenium-webdriver/remote');
const { navigatePage, waitFunction, clickByLocation, getUrl } = require('../util/util');
const assert = require('assert');

var runGuildTests = async function(driver) {
  describe('Guild page tests in guildTest.js', function() {
    this.timeout(10000);
    beforeEach(async function () {
      navigatePage(driver, getUrl('groups/myGuilds'));
      await waitFunction(1000);
    });
    it('Testing my guilds page - filters', async function() {
      let guildItems = await driver.findElements(
        By.xpath(
          "//div[@class='guild-bank']/ancestor::div[@class='card-body']"
        )
      );
      assert.equal(guildItems.length, 2);
      let goldcheckbox = await driver.findElement(
        By.xpath("//label[@for='gold_tier']")
      );
      await goldcheckbox.click();
      guildItems = await driver.findElements(
        By.xpath(
          "//div[@class='guild-bank']/ancestor::div[@class='card-body']"
        )
      );
      assert.equal(guildItems.length, 0);
      await goldcheckbox.click();
    });
    it('Testing search', async function() {
      let searchBar = await driver.findElement(
        By.className('form-control input-search')
      );
      searchBar.sendKeys('local');
      await waitFunction(2000);
      let guildList = await driver.findElements(
        By.xpath(
          "//div[@class='guild-bank']/ancestor::div[@class='card-body']"
        )
      );
      assert.equal(guildList.length, 1);
    });
  })
};

module.exports = {
  runGuildTests: runGuildTests
}