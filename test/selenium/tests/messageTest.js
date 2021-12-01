const { Builder, By, Key, until } = require('selenium-webdriver');
const { SeleniumServer } = require('selenium-webdriver/remote');
const { navigatePage, waitFunction, generateMessage, getUrl } = require('../util/util');
const assert = require('assert');

var runMessageTests = async function(driver) {
  describe('Private Message Tests in messageTest.js', function() {
    this.timeout(10000);
    beforeEach(async function () {
      navigatePage(driver, getUrl('private-messages'));
      await waitFunction(3000);
    });
    it('Send Message Test', async function() {
      // Use self messages
      let conversation = await driver.findElement(
        By.xpath(
        "//div[contains(text(), 'seleniumTester')]/ancestor::div[@class='conversation']"
      ));
      await conversation.click();
      await waitFunction(500);
      let searchbar = await driver.findElement(
        By.xpath(
          "//textarea[@placeholder='Type your message here.']"
        )
      );
      let message = generateMessage();
      searchbar.sendKeys(message);
      let sendButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Send')]")
      );
      await sendButton.click();
      let messageCard = driver.findElement(
        By.xpath(
          `//p[contains(text(), '${message}')]`
        ));
      let sentMsg = await messageCard.getText();
      assert.equal(sentMsg, message);
    });
  })
};

module.exports = {
  runMessageTests: runMessageTests
}