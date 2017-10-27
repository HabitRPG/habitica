import i18n from '../i18n';
import each from 'lodash/each';
import { capByLevel } from '../statHelpers';
import { MAX_LEVEL } from '../constants';
import {
  NotAuthorized,
} from '../libs/errors';
import equip from './equip';
import { removePinnedGearByClass } from './pinnedGearUtils';


const USERSTATSLIST = ['per', 'int', 'con', 'str', 'points', 'gp', 'exp', 'mp'];

module.exports = function rebirth (user, tasks = [], req = {}, analytics) {
  if (user.balance < 1.5 && user.stats.lvl < MAX_LEVEL) {
    throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
  }

  let analyticsData = {
    uuid: user._id,
    category: 'behavior',
  };

  if (user.stats.lvl < MAX_LEVEL) {
    user.balance -= 1.5;
    analyticsData.acquireMethod = 'Gems';
    analyticsData.gemCost = 6;
  } else {
    analyticsData.gemCost = 0;
    analyticsData.acquireMethod = '> 100';
  }

  if (analytics) {
    analyticsData.headers = req.headers;
    analytics.track('Rebirth', analyticsData);
  }

  let lvl = capByLevel(user.stats.lvl);

  each(tasks, function resetTasks (task) {
    if (!task.challenge || !task.challenge.id || task.challenge.broken) {
      if (task.type !== 'reward') {
        task.value = 0;
      }
      if (task.type === 'daily') {
        task.streak = 0;
      }
    }
  });

  removePinnedGearByClass(user);

  let stats = user.stats;
  stats.buffs = {};
  stats.hp = 50;
  stats.lvl = 1;
  stats.class = 'warrior';

  user.preferences.automaticAllocation = false;

  each(USERSTATSLIST, function resetStats (value) {
    stats[value] = 0;
  });

  if (user.items.currentPet) {
    equip(user, {
      params: {
        type: 'pet',
        key: user.items.currentPet,
      },
    });
  }

  if (user.items.currentMount) {
    equip(user, {
      params: {
        type: 'mount',
        key: user.items.currentMount,
      },
    });
  }

  let flags = user.flags;
  flags.itemsEnabled = false;
  flags.dropsEnabled = false;
  flags.classSelected = false;
  flags.rebirthEnabled = false;
  flags.levelDrops = {};

  if (!user.achievements.rebirths) {
    user.achievements.rebirths = 1;
    user.achievements.rebirthLevel = lvl;
  } else if (lvl > user.achievements.rebirthLevel || lvl === MAX_LEVEL) {
    user.achievements.rebirths++;
    user.achievements.rebirthLevel = lvl;
  }

  if (user.addNotification) user.addNotification('REBIRTH_ACHIEVEMENT');

  user.stats.buffs = {};

  return [
    {user, tasks},
    i18n.t('rebirthComplete'),
  ];
};
