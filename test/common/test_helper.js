/* eslint-disable prefer-template, no-shadow, func-names, import/no-commonjs */

const expect = require('expect.js');

module.exports.addCustomMatchers = function () {
  const { Assertion } = expect;
  Assertion.prototype.toHaveGP = function (gp) {
    const actual = this.obj.stats.gp;
    return this.assert(actual === gp, () => 'expected user to have ' + gp + ' gp, but got ' + actual, () => 'expected user to not have ' + gp + ' gp');
  };
  Assertion.prototype.toHaveHP = function (hp) {
    const actual = this.obj.stats.hp;
    return this.assert(actual === hp, () => 'expected user to have ' + hp + ' hp, but got ' + actual, () => 'expected user to not have ' + hp + ' hp');
  };
  Assertion.prototype.toHaveExp = function (exp) {
    const actual = this.obj.stats.exp;
    return this.assert(actual === exp, () => 'expected user to have ' + exp + ' experience points, but got ' + actual, () => 'expected user to not have ' + exp + ' experience points');
  };
  Assertion.prototype.toHaveLevel = function (lvl) {
    const actual = this.obj.stats.lvl;
    return this.assert(actual === lvl, () => 'expected user to be level ' + lvl + ', but got ' + actual, () => 'expected user to not be level ' + lvl);
  };
  Assertion.prototype.toHaveMaxMP = function (mp) {
    const actual = this.obj._statsComputed.maxMP;
    return this.assert(actual === mp, () => 'expected user to have ' + mp + ' max mp, but got ' + actual, () => 'expected user to not have ' + mp + ' max mp');
  };
};
