/* eslint-disable prefer-template, no-shadow, func-names */

let expect = require('expect.js');

module.exports.addCustomMatchers = function () {
  let Assertion;

  Assertion = expect.Assertion;
  Assertion.prototype.toHaveGP = function (gp) {
    let actual;

    actual = this.obj.stats.gp;
    return this.assert(actual === gp, () => {
      return 'expected user to have ' + gp + ' gp, but got ' + actual;
    }, () => {
      return 'expected user to not have ' + gp + ' gp';
    });
  };
  Assertion.prototype.toHaveHP = function (hp) {
    let actual;

    actual = this.obj.stats.hp;
    return this.assert(actual === hp, () => {
      return 'expected user to have ' + hp + ' hp, but got ' + actual;
    }, () => {
      return 'expected user to not have ' + hp + ' hp';
    });
  };
  Assertion.prototype.toHaveExp = function (exp) {
    let actual;

    actual = this.obj.stats.exp;
    return this.assert(actual === exp, () => {
      return 'expected user to have ' + exp + ' experience points, but got ' + actual;
    }, () => {
      return 'expected user to not have ' + exp + ' experience points';
    });
  };
  Assertion.prototype.toHaveLevel = function (lvl) {
    let actual;

    actual = this.obj.stats.lvl;
    return this.assert(actual === lvl, () => {
      return 'expected user to be level ' + lvl + ', but got ' + actual;
    }, () => {
      return 'expected user to not be level ' + lvl;
    });
  };
  Assertion.prototype.toHaveMaxMP = function (mp) {
    let actual;

    actual = this.obj._statsComputed.maxMP;
    return this.assert(actual === mp, () => {
      return 'expected user to have ' + mp + ' max mp, but got ' + actual;
    }, () => {
      return 'expected user to not have ' + mp + ' max mp';
    });
  };
};
