'use strict';

let logger = require('./logger');

class Timer {
  constructor (options) {
    options = options || {};
    let warningThreshold = options.minutesWarningThreshold || 10;

    this.count = 0;
    this._minutesWarningThreshold = warningThreshold * 60;

    if (!options.disableAutoStart) this.start();
  }
  start () {
    this._internalTimer = setInterval(() =>{
      this.count++;

      let shouldWarn = this._minutesWarningThreshold < this.count;
      let logStyle =  shouldWarn ? 'error' : 'warn';
      let dangerMessage = shouldWarn ? 'DANGER: ' : '';

      if (this.count % 30 === 0) {
        logger[logStyle](`${dangerMessage}Process has been running for`, this.count / 60, 'minutes');
      }
    }, 1000);
  }
  stop () {
    if (!this._internalTimer) {
      throw new Error('Timer has not started');
    }
    clearInterval(this._internalTimer);
  }

  get seconds () {
    return this.count;
  }

  get minutes () {
    return this.count / 60;
  }
}

module.exports = Timer;
