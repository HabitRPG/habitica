var expect;

expect = require('expect.js');

module.exports.addCustomMatchers = function() {
  var Assertion;
  Assertion = expect.Assertion;
  Assertion.prototype.toHaveGP = function(gp) {
    var actual;
    actual = this.obj.stats.gp;
    return this.assert(actual === gp, function() {
      return "expected user to have " + gp + " gp, but got " + actual;
    }, function() {
      return "expected user to not have " + gp + " gp";
    });
  };
  Assertion.prototype.toHaveHP = function(hp) {
    var actual;
    actual = this.obj.stats.hp;
    return this.assert(actual === hp, function() {
      return "expected user to have " + hp + " hp, but got " + actual;
    }, function() {
      return "expected user to not have " + hp + " hp";
    });
  };
  Assertion.prototype.toHaveExp = function(exp) {
    var actual;
    actual = this.obj.stats.exp;
    return this.assert(actual === exp, function() {
      return "expected user to have " + exp + " experience points, but got " + actual;
    }, function() {
      return "expected user to not have " + exp + " experience points";
    });
  };
  Assertion.prototype.toHaveLevel = function(lvl) {
    var actual;
    actual = this.obj.stats.lvl;
    return this.assert(actual === lvl, function() {
      return "expected user to be level " + lvl + ", but got " + actual;
    }, function() {
      return "expected user to not be level " + lvl;
    });
  };
  return Assertion.prototype.toHaveMaxMP = function(mp) {
    var actual;
    actual = this.obj._statsComputed.maxMP;
    return this.assert(actual === mp, function() {
      return "expected user to have " + mp + " max mp, but got " + actual;
    }, function() {
      return "expected user to not have " + mp + " max mp";
    });
  };
};
