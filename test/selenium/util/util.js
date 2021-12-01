const { Builder, By, Key, until } = require('selenium-webdriver');
const { URL } = require('../config/config.js');

/**
 * Basic function to wait for a certain period of time
 */
var waitFunction= function (time) {
  return new Promise((res) => {
    setTimeout(res, time);
  });
}

/**
 * Basic function to scroll to an element
 */
var scrollToElement = function (driver, element) {
  driver.executeScript("arguments[0].scrollIntoView()", element);
}

var deleteElement = function(driver, className) {
  driver.executeScript(`return document.getElementsByClassName('${className}')[0].remove();`);
}

/**
 * A more robust approach to clicking an element, as opposed to
 * element.click().
 * Takes the element's rectangles, moves to the coordinates,
 * and clicks accordingly insetad of clicking directly, thus
 * avoiding issues with unseletable elements.
 */
var clickByLocation = async function(driver, element) {
  let rect = await element.getRect();
  await driver.actions().move({
    origin: element,
    x: rect.width / 2,
    y: rect.height / 2,
  }).click().perform();
}

/**
 * Natigates to the specified url if the browser hasn't
 * Make sure the url ends with '/' if it's homepage
 */
var navigatePage = async function(driver, url) {
  let currUrl = await driver.getCurrentUrl();
  if (currUrl != url) {
    await driver.get(url);
  }
}

/**
 * Generate a random message for testing purposes
 * Useful for message testing
 */

var generateMessage = function() {
  let num = Math.floor(Math.random() * (99999 - 10000) + 10000);
  return 'Test Message ' + num;
}

/**
 * Generate URL
 */
var getUrl = function(route) {
  if (!route) {
    return URL
  }
  return URL + route;
}

/**
 * Check if element exists, using xpath
 */
var checkIfElementExistsXpath = async function(driver, xpath) {
  let elements = await driver.findElements(By.xpath(xpath));
  return elements.length > 0;
}

/**
 * Check if element exists, using css
 */
var checkIfElementExistsCss = async function(driver, css) {
  let elements = await driver.findElements(By.css(css));
  return elements.length > 0;
}

/**
 * Check if element exists, using classname
 */
var checkIfElementExistsClassName = async function(driver, className) {
  let elements = await driver.findElements(By.className(className));
  return elements.length > 0;
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
}