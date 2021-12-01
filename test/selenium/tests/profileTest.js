const { Builder, By, Key, until } = require('selenium-webdriver');
const { SeleniumServer } = require('selenium-webdriver/remote');
const { navigatePage, waitFunction, generateMessage, getUrl } = require('../util/util');
const assert = require('assert');

var runProfileTests = async function(driver) {
  describe('Profile tests in profileTest.js', function() {
    this.timeout(10000);
    beforeEach(async function () {
      navigatePage(driver, getUrl('user/profile'));
      await waitFunction(1500);
    });
    it('Updating profile test', async function() {
      let editButton = driver.findElement(
        By.xpath("//div[@id='userProfile']/descendant::button[contains(text(), 'Edit')]")
      );
      await editButton.click();
      let aboutSection = await driver.findElement(
        By.xpath("//textarea[@placeholder='Please introduce yourself']")
      );
      aboutSection.clear();
      let message = generateMessage();
      aboutSection.sendKeys(message);
      let saveButton = await driver.findElement(
        By.xpath("//div[@id='userProfile']/descendant::button[contains(text(), 'Save')]")
      );
      saveButton.click();
      await waitFunction(500);
      aboutSection = await driver.findElement(
        By.xpath("//div[@class='about profile-section']" +
        `/descendant::p[contains(text(), '${message}')]`
      ));
      let aboutText = await aboutSection.getText();
      assert.equal(aboutText, message);
    });
  })
};

module.exports = {
  runProfileTests: runProfileTests
}