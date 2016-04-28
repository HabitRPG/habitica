import _ from 'lodash';
import {
  MAX_HEALTH,
  MAX_STAT_POINTS
} from '../constants';
import { toNextLevel } from '../statHelpers';
module.exports = function (user, stats, req, analytics) {
  let allocatedStatPoints;
  let totalStatPoints;
  let experienceToNextLevel;

  if (stats.hp <= 0) {
    user.stats.hp = 0;
    return user.stats.hp;
  }

  user.stats.hp = stats.hp;
  user.stats.gp = stats.gp >= 0 ? stats.gp : 0;

  experienceToNextLevel = toNextLevel(user.stats.lvl);

  if (stats.exp >= experienceToNextLevel) {
    user.stats.exp = stats.exp;

    while (stats.exp >= experienceToNextLevel) {
      stats.exp -= experienceToNextLevel;
      user.stats.lvl++;

      experienceToNextLevel = toNextLevel(user.stats.lvl);
      user.stats.hp = MAX_HEALTH;
      allocatedStatPoints = user.stats.str + user.stats.int + user.stats.con + user.stats.per;
      totalStatPoints = allocatedStatPoints + user.stats.points;

      if (totalStatPoints >= MAX_STAT_POINTS) {
        continue; // eslint-disable-line no-continue
      }
      if (user.preferences.automaticAllocation) {
        user.fns.autoAllocate();
      } else {
        user.stats.points = user.stats.lvl - allocatedStatPoints;
        totalStatPoints = user.stats.points + allocatedStatPoints;

        if (totalStatPoints > MAX_STAT_POINTS) {
          user.stats.points = MAX_STAT_POINTS - allocatedStatPoints;
        }

        if (user.stats.points < 0) {
          user.stats.points = 0;
        }
      }
    }
  }

  user.stats.exp = stats.exp;
  user.flags = user.flags || {};

  if (!user.flags.customizationsNotification && (user.stats.exp > 5 || user.stats.lvl > 1)) {
    user.flags.customizationsNotification = true;
  }
  if (!user.flags.itemsEnabled && (user.stats.exp > 10 || user.stats.lvl > 1)) {
    user.flags.itemsEnabled = true;
  }
  if (!user.flags.dropsEnabled && user.stats.lvl >= 3) {
    user.flags.dropsEnabled = true;
    if (user.items.eggs["Wolf"] > 0) {
      user.items.eggs["Wolf"]++;
    } else {
      user.items.eggs["Wolf"] = 1;
    }
  }
  if (!user.flags.classSelected && user.stats.lvl >= 10) {
    user.flags.classSelected;
  }
  _.each({
    vice1: 30,
    atom1: 15,
    moonstone1: 60,
    goldenknight1: 40
  }, function(lvl, k) {
    var analyticsData, base, base1, ref;
    if (!((ref = user.flags.levelDrops) != null ? ref[k] : void 0) && user.stats.lvl >= lvl) {
      if ((base = user.items.quests)[k] == null) {
        base[k] = 0;
      }
      user.items.quests[k]++;
      ((base1 = user.flags).levelDrops != null ? base1.levelDrops : base1.levelDrops = {})[k] = true;
      if (typeof user.markModified === "function") {
        user.markModified('flags.levelDrops');
      }
      analyticsData = {
        uuid: user._id,
        itemKey: k,
        acquireMethod: 'Level Drop',
        category: 'behavior'
      };
      if (analytics != null) {
        analytics.track('acquire item', analyticsData);
      }
      if (!user._tmp) user._tmp = {}
      return user._tmp.drop = {
        type: 'Quest',
        key: k
      };
    }
  });
  if (!user.flags.rebirthEnabled && (user.stats.lvl >= 50 || user.achievements.beastMaster)) {
    return user.flags.rebirthEnabled = true;
  }
};
