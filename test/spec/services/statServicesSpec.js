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

  describe('expDisplay', function() {
    it('displays exp as "exp / toNextLevelExp"', function() {
      user.stats.exp = 10;
      user.stats.lvl = 29;
      var expDisplay = statCalc.expDisplay(user);

      expect(expDisplay).to.eql('10/640');
    });

    it('Rounds exp down when given a decimal', function() {
      user.stats.exp = 10.999;
      user.stats.lvl = 29;
      var expDisplay = statCalc.expDisplay(user);

      expect(expDisplay).to.eql('10/640');
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

  describe('goldDisplay', function() {
    it('displays gold', function() {
      var gold = 30;
      var goldDisplay = statCalc.goldDisplay(gold);

      expect(goldDisplay).to.eql(30);
    });

    it('Rounds gold down when given a decimal', function() {
      var gold = 30.999;
      var goldDisplay = statCalc.goldDisplay(gold);

      expect(goldDisplay).to.eql(30);
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

  describe('mpDisplay', function() {
    it('displays mp as "mp / totalMP"', function() {
      user._statsComputed = { maxMP: 100 };
      user.stats.mp = 30;
      var mpDisplay = statCalc.mpDisplay(user);

      expect(mpDisplay).to.eql('30/100');
    });

    it('Rounds mp down when given a decimal', function() {
      user._statsComputed = { maxMP: 100 };
      user.stats.mp = 30.99;
      var mpDisplay = statCalc.mpDisplay(user);

      expect(mpDisplay).to.eql('30/100');
    });
  });
});
