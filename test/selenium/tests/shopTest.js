const { Builder, By, Key, until } = require('selenium-webdriver');
const { SeleniumServer } = require('selenium-webdriver/remote');
const { navigatePage, waitFunction, generateMessage, getUrl } = require('../util/util');
const { getGems, expandInventory } = require('../util/common.js');
const assert = require('assert');

/**
 * Test shop functionality. The account should have gems
 * to make purchases, which shouldn't be a problem due to the 
 * debug tests.
 */

var numChocolate;
var numSlimeQuests;
var numGems;

var runShopTests = async function(driver) {
  describe('Shop tests in shopTest.js', function() {
    this.timeout(20000);
    it ('Checking inventory first', async function() {
      navigatePage(driver, getUrl('inventory/items'));
      await waitFunction(2000);
      expandInventory(driver);
      await waitFunction(1000);

      let invChocElmt = await driver.findElement(
        By.xpath(
          "//span[@class='item-content Pet_Food_Chocolate']" +
          "/preceding-sibling::span"
        )
      );
      numChocolate = parseInt(await invChocElmt.getText());

      let slimeQuestElmt = await driver.findElement(
        By.xpath(
          "//span[@class='item-content inventory_quest_scroll_slime']" +
          "/preceding-sibling::span"
        )
      );
      numSlimeQuests = parseInt(await slimeQuestElmt.getText());

    })
    it('Testing shop functionality', async function() {
      navigatePage(driver, getUrl('shops/market'));
      await waitFunction(2000);
      numGems = await getGems(driver);
      // Buy chocolate
      let chocolate = await driver.findElement(
        By.className('Pet_Food_Chocolate')
      );
      await chocolate.click();
      await waitFunction(200);
      let buyNow = await driver.findElement(
        By.xpath("//button[contains(text(), 'Buy Now')]")
      );
      await buyNow.click();
      let alert = await driver.switchTo().alert();
      await alert.accept();
      await waitFunction(400);

      // Buy slime quest
      navigatePage(driver, getUrl('shops/quests'));
      await waitFunction(2000);
      let questScroll = await driver.findElement(
        By.className('inventory_quest_scroll_slime')
      );
      await questScroll.click();
      await waitFunction(600);
      buyNow = await driver.findElement(
        By.xpath("//button[contains(text(), 'Buy Now')]")
      );
      await buyNow.click();
      alert = await driver.switchTo().alert();
      await alert.accept();
      await waitFunction(400);
    });
    it('Testing transaction results', async function() {
      navigatePage(driver, getUrl('inventory/items'));
      await waitFunction(2000);

      let invChocElmt = await driver.findElement(
        By.xpath(
          "//span[@class='item-content Pet_Food_Chocolate']" +
          "/preceding-sibling::span"
        )
      );
      let currChocolate = parseInt(await invChocElmt.getText());
      assert.equal(currChocolate, numChocolate + 1);

      let slimeQuestElmt = await driver.findElement(
        By.xpath(
          "//span[@class='item-content inventory_quest_scroll_slime']" +
          "/preceding-sibling::span"
        )
      );
      let currSlimeQuests = parseInt(await slimeQuestElmt.getText());
      assert.equal(currSlimeQuests, numSlimeQuests + 1);
      
      let currGems = await getGems(driver);
      assert.equal(currGems, numGems - 5);
    })
  })
};

module.exports = {
  runShopTests: runShopTests
}