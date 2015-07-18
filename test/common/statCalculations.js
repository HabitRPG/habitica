'use strict';
var sinon = require('sinon');
var chai = require("chai");
chai.use(require("sinon-chai"));
var expect = chai.expect;

var statCalc = require('../../common/script/methods/statCalculations');

describe('stat calculation functions', function() {
  describe('levelBonus', function() {
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

  describe('equipmentStatBonus', function() {
    it('tallies up stats from euqipment that is equipped', function() {
      var equippedGear = {
        "weapon" : "weapon_special_1",
        "shield" : "shield_special_1",
        "head" : "head_special_1",
        "armor" : "armor_special_1"
      };

      var strStat = statCalc.equipmentStatBonus('str', equippedGear);
      var conStat = statCalc.equipmentStatBonus('con', equippedGear);
      var intStat = statCalc.equipmentStatBonus('int', equippedGear);
      var perStat = statCalc.equipmentStatBonus('per', equippedGear);

      expect(strStat).to.eql(24);
      expect(conStat).to.eql(24);
      expect(intStat).to.eql(24);
      expect(perStat).to.eql(24);
    });
  });
});
