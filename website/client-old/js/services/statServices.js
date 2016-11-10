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
    var DROP_ANIMALS = _.keys(Content.pets);
    var TOTAL_NUMBER_OF_DROP_ANIMALS = DROP_ANIMALS.length;

    function beastMasterProgress(pets) {
      var dropPetsFound = Shared.count.beastMasterProgress(pets);
      var display = _formatOutOfTotalDisplay(dropPetsFound, TOTAL_NUMBER_OF_DROP_ANIMALS);

      return display;
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

    function mountMasterProgress(mounts) {
      var dropMountsFound = Shared.count.mountMasterProgress(mounts);
      var display = _formatOutOfTotalDisplay(dropMountsFound, TOTAL_NUMBER_OF_DROP_ANIMALS);

      return display;
    }

    function mpDisplay(user) {
      var remainingMP = Math.floor(user.stats.mp);
      var totalMP = (user.fns && user.fns.statsComputed) ? user.fns.statsComputed().maxMP : null;
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
      expDisplay: expDisplay,
      goldDisplay: goldDisplay,
      hpDisplay: hpDisplay,
      mountMasterProgress: mountMasterProgress,
      mpDisplay: mpDisplay,
      totalCount: totalCount
    }
  }
}());
