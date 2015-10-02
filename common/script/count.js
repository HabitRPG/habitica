'use strict';

var _ = require('lodash');
var content = require('../dist/scripts/content/index');

var DROP_ANIMALS = _.keys(content.pets);

function beastMasterProgress(pets) {
  var count = 0;
  _(DROP_ANIMALS).each(function(animal) {
    if(pets[animal] > 0 || pets[animal] == -1)
      count++
  });

  return count;
}

function dropPetsCurrentlyOwned(pets) {
  var count = 0;

  _(DROP_ANIMALS).each(function(animal) {
    if(pets[animal] > 0)
      count++
  });

  return count;
}

function mountMasterProgress(mounts) {
  var count = 0;
  _(DROP_ANIMALS).each(function(animal) {
    if (mounts[animal])
      count++
  });

  return count;
}

function remainingGearInSet(userGear, set) {
  var gear = _.filter(content.gear.flat, function(item) {
    var setMatches = item.klass === set;
    var hasItem = userGear[item.key];

    return setMatches && !hasItem;
  });

  var count = _.size(gear);

  return count;
}

function questsOfCategory(userQuests, category) {
  var quests = _.filter(content.quests, function(quest) {
    var categoryMatches = quest.category === category;
    var hasQuest = userQuests[quest.key];

    return categoryMatches && hasQuest;
  });

  var count = _.size(quests);

  return count;
}

module.exports = {
  beastMasterProgress: beastMasterProgress,
  dropPetsCurrentlyOwned: dropPetsCurrentlyOwned,
  mountMasterProgress: mountMasterProgress,
  remainingGearInSet: remainingGearInSet,
  questsOfCategory: questsOfCategory
};
