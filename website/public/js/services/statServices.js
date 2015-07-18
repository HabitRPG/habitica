'use strict';

(function(){
  angular
    .module('habitrpg')
    .factory('Stats', statsFactory);

  statsFactory.$inject = [
    'Content',
    'Shared'
  ];

  function statsFactory(Content, Shared) {

    function hpDisplay(hp) {
      var remainingHP = Math.ceil(hp);
      var totalHP = Shared.maxHealth;
      var display = remainingHP + '/' + totalHP;

      return display;
    }

    function goldDisplay(gold) {
      var display = Math.floor(gold);
      return display;
    }

    function mpDisplay(user) {
      var remainingMP = Math.floor(user.stats.mp);
      var totalMP = user._statsComputed.maxMP;
      var display = remainingMP + '/' + totalMP;

      return display;
    }

    function levelBonus(level) {
      // Level bonus is derived by taking the level, subtracting one,
      // taking the smaller of it or maxLevel (100),
      // dividing that by two and then raising it to a whole number

      var levelOrMaxLevel = Math.min((level - 1), Shared.maxLevel);
      var levelDividedByTwo = levelOrMaxLevel / 2;
      var bonus = Math.ceil(levelDividedByTwo );

      return bonus;
    }

    function equipmentStatBonus(stat, equipped) {
      var gear = Content.gear.flat;
      var total = 0;

      var equipmentTypes = ['weapon', 'armor', 'head', 'shield'];

      _(equipmentTypes).each(function(type) {
        var equippedItem = equipped[type];
        if(gear[equippedItem]) {
          var equipmentStat = gear[equippedItem][stat];

          total += equipmentStat;
        }
      });

      return total;
    }

    function classBonus(user, stat) {
      var computedStats = user._statsComputed;

      if(computedStats) {
        var bonus = computedStats[stat]
          - user.stats.buffs[stat]
          - levelBonus(user.stats.lvl)
          - equipmentStatBonus(stat, user.items.gear.equipped)
          - user.stats[stat];

        return bonus;
      }
    }

    return {
      classBonus: classBonus,
      equipmentStatBonus: equipmentStatBonus,
      goldDisplay: goldDisplay,
      hpDisplay: hpDisplay,
      levelBonus: levelBonus,
      mpDisplay: mpDisplay
    }
  }
}());
