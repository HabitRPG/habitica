const { Builder, By, Key, until } = require('selenium-webdriver');
const { SeleniumServer } = require('selenium-webdriver/remote');
const { navigatePage, waitFunction, generateMessage, getUrl } = require('../util/util');
const { getGems } = require('../util/common.js');
const assert = require('assert');

var numChocolate;
var numGems;

var runShopTests = async function(driver) {
  describe('Shop tests in shopTest.js', function() {
    this.timeout(10000);
    it ('Checking inventory first', async function() {
      navigatePage(driver, getUrl('inventory/items'));
      await waitFunction(2000);

      let invChocElmt = await driver.findElement(
        By.xpath(
          "//span[@class='item-content Pet_Food_Chocolate']" +
          "/preceding-sibling::span"
        )
      );
      numChocolate = parseInt(await invChocElmt.getText());
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
      
      let currGems = await getGems(driver);
      assert.equal(currGems, numGems - 1);
    })
  })
};

module.exports = {
  runShopTests: runShopTests
}