import _ from 'lodash';

module.exports = function(user, req, cb) {
  var gear;
  user.habits = [];
  user.dailys = [];
  user.todos = [];
  user.rewards = [];
  user.stats.hp = 50;
  user.stats.lvl = 1;
  user.stats.gp = 0;
  user.stats.exp = 0;
  gear = user.items.gear;
  _.each(['equipped', 'costume'], function(type) {
    gear[type].armor = 'armor_base_0';
    gear[type].weapon = 'weapon_base_0';
    gear[type].head = 'head_base_0';
    return gear[type].shield = 'shield_base_0';
  });
  if (typeof gear.owned === 'undefined') {
    gear.owned = {};
  }
  _.each(gear.owned, function(v, k) {
    if (gear.owned[k]) {
      gear.owned[k] = false;
    }
    return true;
  });
  gear.owned.weapon_warrior_0 = true;
  if (typeof user.markModified === "function") {
    user.markModified('items.gear.owned');
  }
  user.preferences.costume = false;
  return typeof cb === "function" ? cb(null, user) : void 0;
};
