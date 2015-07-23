'use strict';

require('coffee-script');
var _ = require('lodash');
var content = require('./content.coffee');

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

module.exports = {
  beastMasterProgress: beastMasterProgress,
  dropPetsCurrentlyOwned: dropPetsCurrentlyOwned,
  mountMasterProgress: mountMasterProgress,
  remainingGearInSet: remainingGearInSet
};
