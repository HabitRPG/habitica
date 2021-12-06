const { Builder, By, Key, until } = require('selenium-webdriver');
const { SeleniumServer } = require('selenium-webdriver/remote');
const { navigatePage, waitFunction, generateMessage, getUrl } = require('../util/util');
const assert = require('assert');

var runPartyTests = async function(driver) {
  describe('Party tests in partyTest.js', function() {
    this.timeout(10000);
    beforeEach(async function () {
      navigatePage(driver, getUrl('party'));
      await waitFunction(2000);
    });
    it('Party Message Test', async function() {
      let chatText = await driver.findElement(
        By.css('textarea')
      );
      let message = generateMessage();
      chatText.sendKeys(message);

      let sendButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Send')]")
      );
      await sendButton.click();
      await waitFunction(400);
      let messageCard = driver.findElement(
        By.xpath(
          `//p[contains(text(), '${message}')]`
      ));
      let sentMsg = await messageCard.getText();
      assert.equal(sentMsg, message);
    });
    it('Party settings test', async function() {
      let dropdownBtn = driver.findElement(
        By.css("button.dropdown-toggle")
      );
      await dropdownBtn.click();
      let editParty = driver.findElement(
        By.xpath("//span[contains(text(), 'Edit Party')]")
      );
      await editParty.click();
      let editDescription = driver.findElement(
        By.xpath("//div[@class='modal-body']/descendant::textarea")
      );
      let message = generateMessage();
      await editDescription.clear();
      await editDescription.sendKeys(message);
      let updatePartyBtn = driver.findElement(
        By.xpath("//button[contains(text(), 'Update Party')]")
      );
      await updatePartyBtn.click();
      await waitFunction(800);
      let partyDescription = await driver.findElement(
        By.xpath(`//p[contains(text(), '${message}')]`)
      );
      let descriptionText = await partyDescription.getText();
      assert.equal(descriptionText, message);
    })
  })
};

module.exports = {
  runPartyTests: runPartyTests
}