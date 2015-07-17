'use strict';
var sinon = require('sinon');
var chai = require("chai");
chai.use(require("sinon-chai"));
var expect = chai.expect;

var statCalc = require('../../common/script/methods/statCalculations');

describe('stat calculation functions', function() {
  describe('calculateLevelStatBonus', function() {
    it('calculates bonus as half of level for even numbered level under 100', function() {
      var level = 50;
      var bonus = statCalc.levelBonus(level);
      expect(bonus).to.eql(25);
    });

    it('calculates bonus as half of level, rounded down, for odd numbered level under 100', function() {
      var level = 51;
      var bonus = statCalc.levelBonus(level);
      expect(bonus).to.eql(25);
    });

    it('calculates bonus as 50 for levels >= 100', function() {
      var level = 150;
      var bonus = statCalc.levelBonus(level);
      expect(bonus).to.eql(50);
    });

    it('calculates bonus as 0 for level 1', function() {
      var level = 1;
      var bonus = statCalc.levelBonus(level);
      expect(bonus).to.eql(0);
    });
  });
});
