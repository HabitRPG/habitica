import _ from 'lodash';
import {
  MAX_HEALTH,
  MAX_STAT_POINTS,
} from '../constants';
import { toNextLevel } from '../statHelpers';
import autoAllocate from './autoAllocate';

module.exports = function updateStats (user, stats, req = {}, analytics) {
  let allocatedStatPoints;
  let totalStatPoints;
  let experienceToNextLevel;

  user.stats.hp = stats.hp > 0 ? stats.hp : 0;
  user.stats.gp = stats.gp > 0 ? stats.gp : 0;
  if (!user._tmp) user._tmp = {};

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
        autoAllocate(user);
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

  if (!user.flags.customizationsNotification && (user.stats.exp > 5 || user.stats.lvl > 1)) {
    user.flags.customizationsNotification = true;
  }
  if (!user.flags.itemsEnabled && (user.stats.exp > 10 || user.stats.lvl > 1)) {
    user.flags.itemsEnabled = true;
  }
  if (!user.flags.dropsEnabled && user.stats.lvl >= 3) {
    user.flags.dropsEnabled = true;
    user.addNotification('DROPS_ENABLED');

    if (user.items.eggs.Wolf > 0) {
      user.items.eggs.Wolf++;
    } else {
      user.items.eggs.Wolf = 1;
    }
  }
  _.each({
    vice1: 30,
    atom1: 15,
    moonstone1: 60,
    goldenknight1: 40,
  }, (lvl, k) => {
    if (user.stats.lvl >= lvl && !user.flags.levelDrops[k]) {
      user.flags.levelDrops[k] = true;
      if (!user.items.quests[k])
        user.items.quests[k] = 0;
      user.items.quests[k]++;
      user.markModified('flags.levelDrops');
      if (analytics) {
        analytics.track('acquire item', {
          uuid: user._id,
          itemKey: k,
          acquireMethod: 'Level Drop',
          category: 'behavior',
          headers: req.headers,
        });
      }
      user._tmp.drop = {
        type: 'Quest',
        key: k,
      };
    }
  });
  if (!user.flags.rebirthEnabled && (user.stats.lvl >= 50 || user.achievements.beastMaster)) {
    user.addNotification('REBIRTH_ENABLED');
    user.flags.rebirthEnabled = true;
  }
};
