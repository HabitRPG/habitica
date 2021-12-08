const { Builder, By, Key, until } = require('selenium-webdriver');
const { SeleniumServer } = require('selenium-webdriver/remote');
const { navigatePage, waitFunction, getUrl, checkIfElementExistsCss,
  checkIfElementExistsClassName, 
  checkIfElementExistsXpath} = require('../util/util');
const assert = require('assert');

/**
 * Test adding quest to party workflow.
 * Note: your party cannot be already doing a quest.
 */
var runQuestTests = async function (driver) {
  describe('Quest tests in questTest.js', function () {
    this.timeout(20000);
    it('Comprehensive add quest workflow', async function () {
      await driver.get(getUrl('inventory/items'));
      await waitFunction(1000);
      // Use quest scroll on party
      await driver.get(getUrl('party'));
      await waitFunction(2000);
      let selectQuest = driver.findElement(
        By.xpath("//button[contains(text(), 'Select Quest')]")
      );
      await selectQuest.click();
      await waitFunction(200);
      let slimeQuestScroll = await driver.findElement(
        By.className('inventory_quest_scroll_slime')
      );
      await slimeQuestScroll.click();
      await waitFunction(200);
      let questInvite = await driver.findElement(
        By.xpath("//button[contains(text(), 'Invite Party to Quest')]")
      );
      await questInvite.click();
      await waitFunction(500);
      let lookup = await checkIfElementExistsClassName(driver, 'quest-boss quest_slime');
      assert.equal(lookup, true);

      // Undo the quest here
      let viewDetails = await driver.findElement(
        By.xpath("//button[contains(text(), 'View Details')]")
      );
      await viewDetails.click();
      await waitFunction(500);

      let cancelQuest = await driver.findElement(
        By.xpath("//div[contains(text(), 'Cancel Quest')]")
      );

      await cancelQuest.click();
      let alert = await driver.switchTo().alert();
      await alert.accept();
      await waitFunction(500);
      lookup = await checkIfElementExistsXpath(
        driver,
        "//h4[contains(text(), 'Your Party is not on a Quest')]"
      );
      assert.equal(lookup, true);
    })
  })
}

module.exports = {
  runQuestTests: runQuestTests
}