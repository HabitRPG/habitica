/* eslint-disable import/no-commonjs */
require('../../../../test/helpers/globals.helper.js');

// Shim localStorage
const localStorage = {
  data: {},
  getItem (key) {
    return this.data[key];
  },
  setItem (key, value) {
    this.data[key] = value;
  },
  removeItem (key) {
    delete this.data[key];
  },
};

Object.defineProperty(window, 'localStorage', {
  value: localStorage,
  configurable: true,
  enumerable: true,
  writable: true,
});
