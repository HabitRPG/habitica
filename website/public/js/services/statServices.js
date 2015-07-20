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

    function beastMasterProgress(pets) {

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

    function expDisplay(user) {
      var exp = Math.floor(user.stats.exp);
      var toNextLevel = Shared.tnl(user.stats.lvl);
      var display = _formatOutOfTotalDisplay(exp, toNextLevel);

      return display;
    }

    function goldDisplay(gold) {
      var display = Math.floor(gold);
      return display;
    }

    function hpDisplay(hp) {
      var remainingHP = Math.ceil(hp);
      var totalHP = Shared.maxHealth;
      var display = _formatOutOfTotalDisplay(remainingHP, totalHP);

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

    function mpDisplay(user) {
      var remainingMP = Math.floor(user.stats.mp);
      var totalMP = user._statsComputed.maxMP;
      var display = _formatOutOfTotalDisplay(remainingMP, totalMP);

      return display;
    }

    function totalCount(objectToCount) {
      var total = _.size(objectToCount);

      return total;
    }

    function _formatOutOfTotalDisplay(stat, totalStat) {
      var display = stat + "/" + totalStat;
      return display;
    }

    return {
      beastMasterProgress: beastMasterProgress,
      classBonus: classBonus,
      equipmentStatBonus: equipmentStatBonus,
      expDisplay: expDisplay,
      goldDisplay: goldDisplay,
      hpDisplay: hpDisplay,
      levelBonus: levelBonus,
      mpDisplay: mpDisplay,
      totalCount: totalCount
    }
  }
}());
