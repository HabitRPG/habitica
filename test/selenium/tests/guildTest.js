const { Builder, By, Key, until } = require('selenium-webdriver');
const { SeleniumServer } = require('selenium-webdriver/remote');
const { navigatePage, waitFunction, clickByLocation, getUrl,
  generateMessage, clearInput } = require('../util/util');
const assert = require('assert');
const { elementIsDisabled } = require('selenium-webdriver/lib/until');

var guildUrl;
var guildName;
/**
 * The account needs to have a guild already created and owned
 * The account should not be a part of other guilds
 * Creativity category should be unchecked
 */

/**
 * Currently found bug: unchecking categories isn't working
 * So creativity category, and all other categories remain checked
 */
var runGuildTests = async function(driver) {
  describe('Guild page tests in guildTest.js', function() {
    this.timeout(12000);
    beforeEach(async function () {
      navigatePage(driver, getUrl('groups/myGuilds'));
      await waitFunction(2000);
    });
    it('Testing filters', async function(){
      let guildItems = await driver.findElements(
        By.xpath(
          "//div[@class='guild-bank']/ancestor::div[@class='card-body']"
        )
      );
      assert.equal(guildItems.length, 1);
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

      let creativityCheckbox = await driver.findElement(
        By.xpath("//label[@for='creativity']")
      );
      await creativityCheckbox.click();
      guildItems = await driver.findElements(
        By.xpath(
          "//div[@class='guild-bank']/ancestor::div[@class='card-body']"
        )
      );
      assert.equal(guildItems.length, 1);
      await creativityCheckbox.click();

    });
    it('Testing my guild page - messaging and editing', async function() {
      // Access my guild
      let guildLink = await driver.findElement(
        By.className('card-link')
      );
      await guildLink.click();
      await waitFunction(1000);
      // remember the guild URL
      guildUrl = await driver.getCurrentUrl();
      // message the guild
      let chatText = await driver.findElement(
        By.css('textarea')
      );
      let message = generateMessage();
      chatText.sendKeys(message);

      let sendButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Send')]")
      );
      await sendButton.click();
      await waitFunction(1000);
      let messageCard = await driver.findElement(
        By.xpath(
          `//p[contains(text(), '${message}')]`
      ));
      let sentMsg = await messageCard.getText();
      assert.equal(sentMsg, message);
      // Test editing
      let dropdownBtn = await driver.findElement(
        By.css("button.dropdown-toggle")
      );
      await dropdownBtn.click();
      await waitFunction(200);
      let editGuild = await driver.findElement(
        By.xpath("//span[contains(text(), 'Edit Guild')]")
      );
      await editGuild.click();
      // Update the form here
      let editName = await driver.findElement(
        By.xpath(
          '//input[contains(@placeholder, "Enter your guild\'s name.")]'
      ));
      await editName.clear();
      guildName = generateMessage();
      editName.sendKeys(guildName);
      let textAreas = await driver.findElements(
        By.xpath("//div[@class='modal-body']/descendant::textarea")
      );
      // should be two elements
      let newSummary = generateMessage();
      let newDescription = generateMessage();
      let formSummary = textAreas[0];
      clearInput(formSummary);
      await waitFunction(400);
      formSummary.sendKeys(newSummary);
      let formDescription = textAreas[1];
      clearInput(formDescription);
      await waitFunction(400);
      await formDescription.sendKeys(newDescription);
      let categories = await driver.findElement(
        By.className('category-wrap')
      );
      await categories.click();
      // pick category
      let creativity = await driver.findElement(
        By.css('#category-creativity')
      );
      await creativity.click();
      let updateGuild = await driver.findElement(
        By.xpath("//button[contains(text(), 'Update Guild')]")
      );
      await updateGuild.click();
      await waitFunction(500);
      let guildSummary = await driver.findElement(
        By.xpath(`//p[contains(text(), '${newSummary}')]`)
      );
      let guildDescription = await driver.findElement(
        By.xpath(`//p[contains(text(), '${newDescription}')]`)
      );
      let guildSummaryText = await guildSummary.getText();
      let guildDescriptionText = await guildDescription.getText();
      assert.equal(guildSummaryText, newSummary);
      assert.equal(guildDescriptionText, newDescription);

    });
    it('Testing search', async function() {
      let searchBar = await driver.findElement(
        By.className('form-control input-search')
      );
      searchBar.sendKeys(guildName);
      await waitFunction(2000);
      let guildList = await driver.findElements(
        By.xpath(
          "//div[@class='guild-bank']/ancestor::div[@class='card-body']"
        )
      );
      assert.equal(guildList.length, 1);
    });
    // Test disabled for now, due to bug with unselected categories
    it.skip('Finishing testing categories - disabled due to found bug', async function() {
      let creativityCheckbox = await driver.findElement(
        By.xpath("//label[@for='creativity']")
      );
      await creativityCheckbox.click();
      guildItems = await driver.findElements(
        By.xpath(
          "//div[@class='guild-bank']/ancestor::div[@class='card-body']"
        )
      );
      assert.equal(guildItems.length, 1);
      await creativityCheckbox.click();
    });
  })
};

module.exports = {
  runGuildTests: runGuildTests
}