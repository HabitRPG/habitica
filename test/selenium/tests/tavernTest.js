const { Builder, By, Key, until } = require('selenium-webdriver');
const { SeleniumServer } = require('selenium-webdriver/remote');
const { waitFunction, getUrl, navigatePage, generateMessage } = require('../util/util');
const assert = require('assert');

/**
 * Tavern chat test
 */
var runTavernTests = async function(driver) {
  describe('Running tests on tavern chat', function() {
    this.timeout(10000);
    beforeEach(async function() {
      navigatePage(driver, getUrl('groups/tavern'));
      await waitFunction(2000);
    })
    it('Testing messaging', async function() {
      let chatText = await driver.findElement(
        By.css('textarea')
      );
      // Write a message in the chat
      let testMessage = generateMessage();
      await chatText.sendKeys(testMessage);
      let sendButton = await driver.findElement(By.xpath(
        "//button[contains(text(), 'Send')]"
      ));
      await sendButton.click();
      await waitFunction(1000);
      // Test message: Is there an element with the same message?
        let newMessage = await driver.findElement(By.xpath(
          `//p[contains(text(), '${testMessage}')]`
        ));
        let text = await newMessage.getText();
        assert.equal(text, testMessage);
      
    })
  })
};

module.exports = {
  runTavernTests: runTavernTests
}