import each from 'lodash/each';
import content from '../content/index';

module.exports = function resetGear (user) {
  let gear = user.items.gear;

  each(['equipped', 'costume'], function resetUserGear (type) {
    gear[type] = {};
    gear[type].armor = 'armor_base_0';
    gear[type].weapon = 'weapon_warrior_0';
    gear[type].head = 'head_base_0';
    gear[type].shield = 'shield_base_0';
  });

  // Gear.owned is a Mongo object so the _.each function iterates over hidden properties.
  // The content.gear.flat[k] check should prevent this causing an error
  each(gear.owned, function resetOwnedGear (v, k) {
    if (gear.owned[k] && content.gear.flat[k] && content.gear.flat[k].value) {
      gear.owned[k] = false;
    }
  });

  gear.owned.weapon_warrior_0 = true; // eslint-disable-line camelcase
  user.preferences.costume = false;
};
