'use strict';

require('coffee-script');
var _ = require('lodash');
var content = require('./content');

var DROP_ANIMALS = _.keys(content.pets);

function beastMasterProgress(pets) {
  var count = 0;
  _(DROP_ANIMALS).each(function(animal) {
    if(pets[animal] > 0 || pets[animal] == -1)
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

module.exports = {
  beastMasterProgress: beastMasterProgress,
  mountMasterProgress: mountMasterProgress
};
