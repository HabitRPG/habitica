const { Builder, By, Key, until } = require('selenium-webdriver');
const { SeleniumServer } = require('selenium-webdriver/remote');
const { waitFunction, navigatePage, getUrl, generateMessage,
  checkIfElementExistsXpath } = require('../util/util');
const { getHealth } = require('../util/common.js');
const assert = require('assert');

var driver;

// Keeps driver so helpers don't 
function setDriver(dr) {
  driver = dr;
}

var runTaskTests = function (driver) {
  setDriver(driver);
  describe('Task tests in taskTest.js', function () {
    this.timeout(20000);
    beforeEach(function () {
      navigatePage(driver, getUrl());
    });
    it('Daily Task test', async function () {
      // First get current EXP Level
      // Define function to get the element and value
      let progressBars = await driver.findElements(
        By.className('progress-container')
      );
      let expBar = progressBars[1];
      async function getExp() {
        let expString = await expBar.getText();
        // now we have intial exp to test the values
        let exp = parseInt(expString.split('/')[0]);
        return exp;
      }
      // now we have intial exp to test the values
      let initialExp = await getExp();

      let dailyCheckbox = await driver.findElement(
        By.className('task-control daily-todo-control')
      );
      // click here works
      await dailyCheckbox.click();
      await waitFunction(500);
      //this.timeout(1000);
      // Check the functionality
      let currExp = await getExp();
      // exp diff is inconsistent
      // Now currently checks if exp increased
      // This test is flakey, it appears by adding code for waiting,
      // the test is more stable
      assert.equal(currExp > initialExp, true,
        'Checking if exp updates properly');
      await waitFunction(100);
      // Revert the task completion
      await dailyCheckbox.click();
      currExp = await getExp();
      assert.equal(currExp, initialExp, 'Testing daily task uncheck');
    });

    it('Testing Habits', async function () {
      let startHealth = await getHealth(driver);
      let habitBar = await driver.findElement(
        By.className('task-control habit-control habit-control-negative-enabled')
      );
      habitBar.click();
      let currHealth = await getHealth(driver);
      // This is actually harder to test than expected
      // For now just check if it decreases health
      assert.equal(currHealth < startHealth, true);
    });

    it('Testing add and delete todo', async function() {
      let addTodoBar = await driver.findElement(
        By.xpath("//textarea[@placeholder='Add a To Do']")
      );
      let taskTitle = generateMessage();
      await addTodoBar.sendKeys(taskTitle);
      await addTodoBar.sendKeys(Key.ENTER);
      await waitFunction(500);
      let newTodo = await driver.findElement(
        By.xpath(
          "//h3[@class='task-title markdown']/" +
          `p[contains(text(), '${taskTitle}')]`
        )
      );
      let newTodoText = await newTodo.getText();
      assert.equal(newTodoText, taskTitle);
      // test deletion
      let dropdown = await driver.findElement(
        By.xpath(
          "//h3[@class='task-title markdown']/" +
          `p[contains(text(), '${taskTitle}')]` +
          "/parent::node()/following-sibling::div"
        )
      );
      dropdown.click();
      let deleteButton = await driver.findElement(
        By.xpath(
          "//h3[@class='task-title markdown']/" +
          `p[contains(text(), '${taskTitle}')]` +
          "/parent::node()/following-sibling::div" +
          "/descendant::span[@class='dropdown-icon-item delete-task-item']"
        )
      );
      deleteButton.click();
      await waitFunction(500);
      let alert = await driver.switchTo().alert();
      await alert.accept();
      await waitFunction(500);
      let result = await checkIfElementExistsXpath(
        driver,
        `//h3[@class='task-title markdown']/p[contains(text(), '${taskTitle}')]`
      );
      assert.equal(result, false);
    })

    it('Testing add and delete daily', async function() {
      let addTodoBar = await driver.findElement(
        By.xpath("//textarea[@placeholder='Add a Daily']")
      );
      let taskTitle = generateMessage();
      await addTodoBar.sendKeys(taskTitle);
      await addTodoBar.sendKeys(Key.ENTER);
      await waitFunction(500);
      let newTodo = await driver.findElement(
        By.xpath(
          "//h3[@class='task-title markdown']/" +
          `p[contains(text(), '${taskTitle}')]`
        )
      );
      let newTodoText = await newTodo.getText();
      assert.equal(newTodoText, taskTitle);
      // test deletion
      let dropdown = await driver.findElement(
        By.xpath(
          "//h3[@class='task-title markdown']/" +
          `p[contains(text(), '${taskTitle}')]` +
          "/parent::node()/following-sibling::div"
        )
      );
      dropdown.click();
      let deleteButton = await driver.findElement(
        By.xpath(
          "//h3[@class='task-title markdown']/" +
          `p[contains(text(), '${taskTitle}')]` +
          "/parent::node()/following-sibling::div" +
          "/descendant::span[@class='dropdown-icon-item delete-task-item']"
        )
      );
      deleteButton.click();
      await waitFunction(500);
      let alert = await driver.switchTo().alert();
      await alert.accept();
      await waitFunction(500);
      let result = await checkIfElementExistsXpath(
        driver,
        `//h3[@class='task-title markdown']/p[contains(text(), '${taskTitle}')]`
      );
      assert.equal(result, false);
    })

    it('Testing add and delete habit', async function() {
      let addTodoBar = await driver.findElement(
        By.xpath("//textarea[@placeholder='Add a Habit']")
      );
      let taskTitle = generateMessage();
      await addTodoBar.sendKeys(taskTitle);
      await addTodoBar.sendKeys(Key.ENTER);
      await waitFunction(500);
      let newTodo = await driver.findElement(
        By.xpath(
          "//h3[@class='task-title markdown']/" +
          `p[contains(text(), '${taskTitle}')]`
        )
      );
      let newTodoText = await newTodo.getText();
      assert.equal(newTodoText, taskTitle);
      // test deletion
      let dropdown = await driver.findElement(
        By.xpath(
          "//h3[@class='task-title markdown']/" +
          `p[contains(text(), '${taskTitle}')]` +
          "/parent::node()/following-sibling::div"
        )
      );
      dropdown.click();
      let deleteButton = await driver.findElement(
        By.xpath(
          "//h3[@class='task-title markdown']/" +
          `p[contains(text(), '${taskTitle}')]` +
          "/parent::node()/following-sibling::div" +
          "/descendant::span[@class='dropdown-icon-item delete-task-item']"
        )
      );
      deleteButton.click();
      await waitFunction(500);
      let alert = await driver.switchTo().alert();
      await alert.accept();
      await waitFunction(500);
      let result = await checkIfElementExistsXpath(
        driver,
        `//h3[@class='task-title markdown']/p[contains(text(), '${taskTitle}')]`
      );
      assert.equal(result, false);
    })
  });
}

module.exports = {
  runTaskTests: runTaskTests
}