import content from '../content/index';
import i18n from '../i18n';
import _ from 'lodash';
import { capByLevel } from '../statHelpers';
import { MAX_LEVEL } from '../constants';

module.exports = function(user, req, cb, analytics) {
  var analyticsData, flags, gear, lvl, stats;
  if (user.balance < 2 && user.stats.lvl < MAX_LEVEL) {
    return typeof cb === "function" ? cb({
      code: 401,
      message: i18n.t('notEnoughGems', req.language)
    }) : void 0;
  }
  analyticsData = {
    uuid: user._id,
    category: 'behavior'
  };
  if (user.stats.lvl < MAX_LEVEL) {
    user.balance -= 2;
    analyticsData.acquireMethod = 'Gems';
    analyticsData.gemCost = 8;
  } else {
    analyticsData.gemCost = 0;
    analyticsData.acquireMethod = '> 100';
  }
  if (analytics != null) {
    analytics.track('Rebirth', analyticsData);
  }
  lvl = capByLevel(user.stats.lvl);
  _.each(user.tasks, function(task) {
    if (task.type !== 'reward') {
      task.value = 0;
    }
    if (task.type === 'daily') {
      return task.streak = 0;
    }
  });
  stats = user.stats;
  stats.buffs = {};
  stats.hp = 50;
  stats.lvl = 1;
  stats["class"] = 'warrior';
  _.each(['per', 'int', 'con', 'str', 'points', 'gp', 'exp', 'mp'], function(value) {
    return stats[value] = 0;
  });
  // TODO during refactoring: move all gear code from rebirth() to its own function and then call it in reset() as well
  gear = user.items.gear;
  _.each(['equipped', 'costume'], function(type) {
    gear[type] = {};
    gear[type].armor = 'armor_base_0';
    gear[type].weapon = 'weapon_warrior_0';
    gear[type].head = 'head_base_0';
    return gear[type].shield = 'shield_base_0';
  });
  if (user.items.currentPet) {
    user.ops.equip({
      params: {
        type: 'pet',
        key: user.items.currentPet
      }
    });
  }
  if (user.items.currentMount) {
    user.ops.equip({
      params: {
        type: 'mount',
        key: user.items.currentMount
      }
    });
  }
  _.each(gear.owned, function(v, k) {
    if (gear.owned[k] && content.gear.flat[k].value) {
      gear.owned[k] = false;
      return true;
    }
  });
  gear.owned.weapon_warrior_0 = true;
  if (typeof user.markModified === "function") {
    user.markModified('items.gear.owned');
  }
  user.preferences.costume = false;
  flags = user.flags;
  if (!user.achievements.beastMaster) {
    flags.rebirthEnabled = false;
  }
  flags.itemsEnabled = false;
  flags.dropsEnabled = false;
  flags.classSelected = false;
  flags.levelDrops = {};
  if (!user.achievements.rebirths) {
    user.achievements.rebirths = 1;
    user.achievements.rebirthLevel = lvl;
  } else if (lvl > user.achievements.rebirthLevel || lvl === 100) {
    user.achievements.rebirths++;
    user.achievements.rebirthLevel = lvl;
  }
  user.stats.buffs = {};
  return typeof cb === "function" ? cb(null, user) : void 0;
};
