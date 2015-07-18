'use strict';

var Content = require('../content.coffee');

function levelBonus(level) {
  // Level bonus is derived by taking the level, subtracting one,
  // taking the smaller of it or maxLevel (100),
  // dividing that by two and then raising it to a whole number

  // TODO: 100 is a magic number, extract from script.index into own module and call here
  var levelOrMaxLevel = Math.min((level - 1), 100)
  var levelDividedByTwo = levelOrMaxLevel / 2
  var statBonus = Math.ceil(levelDividedByTwo )

  return statBonus;
}

function equipmentStatBonus(stat, equipped) {
  var gear = Content.gear.flat;
  var total = 0;

  var equipmentTypes = ['weapon', 'armor', 'head', 'shield'];

  _(equipmentTypes).each(function(type) {
    var equippedItem = equipped[type]
    var equipmentStat = gear[equippedItem][stat];

    total += equipmentStat;
  });

  return total;
}

module.exports = {
  levelBonus: levelBonus,
  equipmentStatBonus: equipmentStatBonus
}
