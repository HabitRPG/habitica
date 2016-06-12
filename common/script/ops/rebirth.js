import i18n from '../i18n';
import _ from 'lodash';
import { capByLevel } from '../statHelpers';
import { MAX_LEVEL } from '../constants';
import {
  NotAuthorized,
} from '../libs/errors';
import resetGear from '../fns/resetGear';
import equip from './equip';

const USERSTATSLIST = ['per', 'int', 'con', 'str', 'points', 'gp', 'exp', 'mp'];

module.exports = function rebirth (user, tasks = [], req = {}, analytics) {
  if (user.balance < 2 && user.stats.lvl < MAX_LEVEL) {
    throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
  }

  let analyticsData = {
    uuid: user._id,
    category: 'behavior',
  };

  if (user.stats.lvl < MAX_LEVEL) {
    user.balance -= 2;
    analyticsData.acquireMethod = 'Gems';
    analyticsData.gemCost = 8;
  } else {
    analyticsData.gemCost = 0;
    analyticsData.acquireMethod = '> 100';
  }

  if (analytics) {
    analytics.track('Rebirth', analyticsData);
  }

  let lvl = capByLevel(user.stats.lvl);

  _.each(tasks, function resetTasks (task) {
    if (!task.challenge || !task.challenge.id || task.challenge.broken) {
      if (task.type !== 'reward') {
        task.value = 0;
      }
      if (task.type === 'daily') {
        task.streak = 0;
      }
    }
  });

  let stats = user.stats;
  stats.buffs = {};
  stats.hp = 50;
  stats.lvl = 1;
  stats.class = 'warrior';

  user.preferences.automaticAllocation = false;

  _.each(USERSTATSLIST, function resetStats (value) {
    stats[value] = 0;
  });

  resetGear(user);

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
  } else if (lvl > user.achievements.rebirthLevel || lvl === MAX_LEVEL) {
    user.achievements.rebirths++;
    user.achievements.rebirthLevel = lvl;
  }

  user.addNotification('REBIRTH_ACHIEVEMENT');

  user.stats.buffs = {};

  if (req.v2 === true) {
    return user;
  } else {
    return [
      {user, tasks},
      i18n.t('rebirthComplete'),
    ];
  }
};
