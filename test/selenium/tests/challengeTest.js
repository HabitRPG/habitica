const { Builder, By, Key, until } = require('selenium-webdriver');
const { SeleniumServer } = require('selenium-webdriver/remote');
const { navigatePage, waitFunction, clickByLocation, getUrl, generateMessage } = require('../util/util.js');
const { challengeMessage, taskMessage } = require('../util/challenge.js')
const assert = require('assert');
const challenge = require('../util/challenge.js');

/**
 * Tests workflow for adding challenge to party.
 */
var runChallengeTests = function(driver) {
  describe('Challenge tests in challengeTest.js', async function() {
    this.timeout(30000);
    beforeEach(async function () {
      navigatePage(driver, getUrl('party'));
      // This page seems to take longer to load
      await waitFunction(5000);
    });
    it('Comprehensive party challenge test', async function() {

      let createChallenge = await driver.findElement(
        By.xpath("//button[contains(text(), 'Create Challenge')]")
      );
      await createChallenge.click();
      // Fill out the form
      let challengeName = await driver.findElement(
        By.xpath("//input[@placeholder='What is your Challenge name?']")
      );
      await waitFunction(500);
      let message = challengeMessage();
      await challengeName.sendKeys(message);
      let shortName = await driver.findElement(
        By.xpath("//input[@placeholder='What short tag should be used to identify your Challenge?']")
      );
      await waitFunction(500);
      await shortName.sendKeys('Test Challenge');
      let summaryText = await driver.findElement(
        By.className('summary-textarea')
      );
      await waitFunction(500);
      await summaryText.sendKeys('Insert Summary Here');
      let description = await driver.findElement(
        By.className('description-textarea')
      );
      await waitFunction(500);
      description.sendKeys(generateMessage());
      let addTo = await driver.findElement(
        By.xpath("//select[@class='form-control']")
      );
      let option = await driver.findElement(
        By.xpath("//option[contains(text(), 'Party')]")
      );
      await option.click();
      let category = await driver.findElement(
        By.xpath("//span[@class='category-select']")
      );
      await category.click();
      await waitFunction(200);
      let academics = await driver.findElement(
        By.xpath("//label[@for='challenge-modal-cat-academics']")
      );
      academics.click();
      let addChallengeTasks = await driver.findElement(
        By.xpath("//button[contains(text(), 'Add Challenge Tasks')]")
      );
      await addChallengeTasks.click();
      await waitFunction(1000);
      // Now join the challenge in the party
      // get url for later
      let challengeUrl = await driver.getCurrentUrl();
      let joinButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Join Challenge')]")
      );
      await joinButton.click();
      // Now add a task
      let addTask = await driver.findElement(
        By.xpath("//button[contains(text(), 'Add Task')]")
      );
      await addTask.click();
      let addTodo = await driver.findElement(
        By.xpath("//a[contains(text(), 'To Do')]")
      );
      await addTodo.click();
      await waitFunction(500);
      let addTitle = await driver.findElement(
        By.xpath("//input[@placeholder='Add a title']")
      );
      let newTaskTitle = taskMessage();
      await addTitle.sendKeys(newTaskTitle);
      let createTask = await driver.findElement(
        By.xpath("//button[contains(text(), 'Create')]")
      );
      await createTask.click();
      // Now check the new task
      await driver.get(getUrl(''));
      await waitFunction(2500);
      let newTask = await driver.findElement(
        By.xpath(
          `//p[contains(text(), '${newTaskTitle}')]`
      ));
      let taskText = await newTask.getText();
      assert.equal(taskText, newTaskTitle);
      // Delete the task
      await driver.get(challengeUrl);
      await waitFunction(2000);

      let endChallenge = await driver.findElement(
        By.xpath(
          "//button[contains(text(), 'End Challenge')]"
        )
      );
      await endChallenge.click();
      await waitFunction(1000);
      let deleteChallenge = await driver.findElement(
        By.xpath(
          "//button[contains(text(), 'Delete Challenge')]"
        )
      );
      await deleteChallenge.click();
      await waitFunction(500);
      let alert = await driver.switchTo().alert();
      await alert.accept();
      await waitFunction(500);

      await driver.get(getUrl(''));
      await waitFunction(2000);

      let brokenChallenge = await driver.findElement(
        By.xpath(
          `//p[contains(text(), '${newTaskTitle}')]` +
          "/ancestor::div[@class='task-content']" + 
          "/descendant::div[@class='svg-icon challenge broken']"
      ));
      await brokenChallenge.click();
      await waitFunction(500);
      let removeTask = await driver.findElement(
        By.xpath(
          "//button[contains(text(), 'Remove Tasks')]"
        )
      );
      await removeTask.click();
    })
  })
}

module.exports = {
  runChallengeTests: runChallengeTests
}