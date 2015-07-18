'use strict';

describe('Stats Service', function() {
  var scope, statCalc, user;

  beforeEach(function() {
    user = specHelper.newUser();

    module(function($provide) {
      $provide.value('User', {user: user});
    });

    inject(function($rootScope, $controller, Stats) {
      statCalc = Stats;
    });
  });

  describe('hpDisplay', function() {
    it('displays hp as "hp / totalHP"', function() {
      var hp = 34;
      var hpDisplay = statCalc.hpDisplay(hp);

      expect(hpDisplay).to.eql('34/50');
    });

    it('Rounds hp up when given a decimal', function() {

      var hp = 34.4;
      var hpDisplay = statCalc.hpDisplay(hp);

      expect(hpDisplay).to.eql('35/50');
    });
  });

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

  describe('classBonus', function() {
    it('calculates class bonus', function() {
      var equippedGear = {
        "weapon" : "weapon_warrior_1",
        "shield" : "shield_warrior_1",
        "head" : "head_warrior_1",
        "armor" : "armor_warrior_1"
      };
      var user = {
        _statsComputed: { str: 50 },
        stats: {
          lvl: 10,
          buffs: { str: 10 },
          str: 10
        },
        items: {
         gear: { equipped: equippedGear }
        }
      };
      var stat = 'str';
      var classBonus = statCalc.classBonus(user, stat);

      expect(classBonus).to.eql(20)
    });

    it('does not return value if user has not been wrapped (_statComputed)', function() {
      var equippedGear = {
        "weapon" : "weapon_warrior_1",
        "shield" : "shield_warrior_1",
        "head" : "head_warrior_1",
        "armor" : "armor_warrior_1"
      };
      var user = {
        stats: {
          lvl: 10,
          buffs: { str: 10 },
          str: 10
        },
        items: {
         gear: { equipped: equippedGear }
        }
      };
      var stat = 'str';
      var classBonus = statCalc.classBonus(user, stat);

      expect(classBonus).to.not.exist;
    });
  });
});
