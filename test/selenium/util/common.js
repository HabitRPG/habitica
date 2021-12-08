const { Builder, By, Key, until } = require('selenium-webdriver');
const { checkIfElementExistsClassName, deleteElement, scrollToElement }
  = require('./util.js');

/**
 * This file consists of helper functions that get common elements
 * such as health and gold, and find common elements such as
 * panels.
 */


/**
 * Get user's current amount of health
 */
const getHealth = async function(driver) {
  let healthDisplay = await driver.findElement(By.xpath(
    "//div[@class='progress-bar bg-health']" +
    "/parent::node()/following-sibling::span"
  ));
  let healthText = await healthDisplay.getText();
  let currHealth = parseInt(healthText.split('/')[0]);
  return currHealth;
}

/**
 * Get user's current amount of exp
 */
const getExp = async function(driver) {
  let expDisplay = await driver.findElement(By.xpath(
    "//div[@class='progress-bar bg-experience']" +
    "/parent::node()/following-sibling::span"
  ));
  let expText = await expDisplay.getText();
  let currExp = parseInt(expText.split('/')[0]);
  return currExp;
}

/**
 * Get user's current amount of gold
 */
const getGold = async function(driver) {
  let goldElement = await driver.findElement(
    By.xpath("//div[@class='item-with-icon gold']/descendant::span")
  );
  let amount = parseInt(await goldElement.getText());
  return amount;
}

/**
 * Get user's current amount of gems
 */
const getGems = async function(driver) {
  let gemsElement = await driver.findElement(
    By.xpath("//a[@class='top-menu-icon svg-icon gem']" +
      "/following-sibling::span")
  );
  let numGems = parseInt(await gemsElement.getText());
  return numGems;
}

/**
 * Get user's current level
 */
const getLevel = async function(driver) {
  let levelSpan = await driver.findElement(
    By.xpath(
      "//div[@class='small-text character-level']" +
      "/descendant::span[contains(text(), 'Level')]"
    )
  );
  let text = await levelSpan.getText();
  let words = text.split(' ');
  let level = parseInt(words[1]);
  return level;
}

/**
 * Check if user has mana enabled (on DOM),
 * User doesn't have mana if less than level 10 or hasn't 'selected'
 * a class
 */
const isManaEnabled = async function(driver) {
  let manaBar = await driver.findElements(By.xpath(
    "//div[@class='progress-bar bg-mana']"
  ));
  let lookup = await checkIfElementExistsClassName(driver, 'progress-bar bg-mana');
  return lookup;
}

/**
 * Get user's current amount of mana.
 */
const getMana = async function(driver) {
  let manaDisplay = await driver.findElement(By.xpath(
    "//div[@class='progress-bar bg-mana']" +
    "/parent::node()/following-sibling::span"
  ));
  let manaText = await manaDisplay.getText();
  let currMana = parseInt(manaText.split('/')[0]);
  return currMana;
}

/**
 * Click on the skill panel to hide it.
 */
const hideSkillPanel = async function(driver) {
  // check if skillPanel exists
  let panel = await driver.findElement(
    By.xpath(
      "//div[contains(text(), 'Skills')]"
    )
  );
  await panel.click();
}

/**
 * Deletes the bottom panel element from the DOM, useful in
 * case the panel is blocking elements to interact with.
 */
const deletePanel = async function(driver) {
  deleteElement(driver, 'drawer-container');
}

/**
 * Expands the inventory section by clicking all the
 * show more buttons
 */
const expandInventory = async function(driver) {
  let buttons = await driver.findElements(
    By.xpath("//span[contains(text(), 'Show More')]")
  );
  for (let button of buttons) {
    scrollToElement(driver, button);
    await button.click();
  }
}

module.exports = {
  getHealth: getHealth,
  getExp: getExp,
  getGold: getGold,
  getGems: getGems,
  getLevel: getLevel,
  isManaEnabled: isManaEnabled,
  getMana: getMana,
  hideSkillPanel: hideSkillPanel,
  expandInventory: expandInventory,
  deletePanel: deletePanel
}