const { Builder, By, Key, until } = require('selenium-webdriver');
const { SeleniumServer } = require('selenium-webdriver/remote');
const { waitFunction, navigatePage, getUrl, generateMessage,
  checkIfElementExistsXpath } = require('../util/util');
const { getHealth, getExp, deletePanel } = require('../util/common.js');
const assert = require('assert');

/**
 * This file tests the task functionality.
 * This includes dailies, habits, and todos.
 */
var runTaskTests = function (driver) {
  describe('Task tests in taskTest.js', function () {
    this.timeout(20000);
    beforeEach(async function () {
      navigatePage(driver, getUrl());
      await waitFunction(1000);
    });
    it('Daily Task test', async function () {
      await deletePanel(driver);

      // now we have intial exp to test the values
      let initialExp = await getExp(driver);

      let dailyCheckbox = await driver.findElement(
        By.className('task-control daily-todo-control')
      );
      // click here works
      await dailyCheckbox.click();
      await waitFunction(500);
      // Check the functionality
      let currExp = await getExp(driver);
      // exp diff is inconsistent
      // Now currently checks if exp increased
      assert.equal(currExp > initialExp, true,
        'Checking if exp updates properly');
      await waitFunction(200);
      // Revert the task completion
      await dailyCheckbox.click();
      await waitFunction(1500);
      currExp = await getExp(driver);
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
      await waitFunction(700);
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
      await waitFunction(700);
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
      await waitFunction(700);
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