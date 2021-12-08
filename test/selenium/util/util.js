const { Builder, By, Key, until } = require('selenium-webdriver');
const { URL } = require('../config/config.js');

/**
 * This file consists of several utility helper functions, such
 * as some simple DOM helpers
 */

/**
 * Basic function to wait for a certain period of time
 */
const waitFunction= function(time) {
  return new Promise((res) => {
    setTimeout(res, time);
  });
}

/**
 * Basic function to scroll to an element
 */
const scrollToElement = function(driver, element) {
  driver.executeScript("arguments[0].scrollIntoView()", element);
}

/**
 * Function to delete element from DOM
 */
const deleteElement = function(driver, className) {
  driver.executeScript(`return document.getElementsByClassName('${className}')[0].remove();`);
}

/**
 * A more robust approach to clicking an element, as opposed to
 * element.click().
 * Takes the element's rectangles, moves to the coordinates,
 * and clicks accordingly insetad of clicking directly, thus
 * avoiding issues with unseletable elements.
 */
const clickByLocation = async function(driver, element) {
  let rect = await element.getRect();
  await driver.actions().move({
    origin: element,
    x: ~~(rect.width / 2),
    y: ~~(rect.height / 2),
  }).click().perform();
}

/**
 * Natigates to the specified url if the browser hasn't
 * Make sure the url ends with '/' if it's homepage
 */
const navigatePage = async function(driver, url) {
  let currUrl = await driver.getCurrentUrl();
  if (currUrl != url) {
    await driver.get(url);
  }
}

/**
 * Generate a random message for testing purposes
 * Useful for message testing
 */

const generateMessage = function() {
  let num = Math.floor(Math.random() * (999999 - 100000) + 100000);
  return 'Test Message ' + num;
}

/**
 * Generate URL
 */
const getUrl = function(route) {
  if (!route) {
    return URL
  }
  return URL + route;
}

/**
 * Check if element exists, using xpath
 */
const checkIfElementExistsXpath = async function(driver, xpath) {
  let elements = await driver.findElements(By.xpath(xpath));
  return elements.length > 0;
}

/**
 * Check if element exists, using css
 */
const checkIfElementExistsCss = async function(driver, css) {
  let elements = await driver.findElements(By.css(css));
  return elements.length > 0;
}

/**
 * Check if element exists, using classname
 */
const checkIfElementExistsClassName = async function(driver, className) {
  let elements = await driver.findElements(By.className(className));
  return elements.length > 0;
}

/**
 * More robust way of clearing inputs, use if clear() doesn't work
 */

const clearInput = async function(element) {
  await element.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));
}

module.exports = {
  waitFunction: waitFunction,
  scrollToElement: scrollToElement,
  deleteElement: deleteElement,
  clickByLocation: clickByLocation,
  navigatePage: navigatePage,
  generateMessage: generateMessage,
  getUrl: getUrl,
  checkIfElementExistsXpath: checkIfElementExistsXpath,
  checkIfElementExistsCss: checkIfElementExistsCss,
  checkIfElementExistsClassName: checkIfElementExistsClassName,
  clearInput: clearInput
}