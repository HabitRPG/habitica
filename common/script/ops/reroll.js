import i18n from '../i18n';
import _ from 'lodash';
import {
  NotAuthorized,
} from '../libs/errors';

module.exports = function reroll (user, tasks = [], req = {}, analytics) {
  if (user.balance < 1) {
    throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
  }

  user.balance--;
  user.stats.hp = 50;

  _.each(tasks, function resetTaskValues (task) {
    if (task.type !== 'reward') {
      task.value = 0;
    }
  });

  if (analytics) {
    analytics.track('Fortify Potion', {
      uuid: user._id,
      acquireMethod: 'Gems',
      gemCost: 4,
      category: 'behavior',
    });
  }

  let response = {
    data: {user, tasks},
    message: i18n.t('rerollComplete'),
  };

  if (req.v2 === true) {
    return user;
  } else {
    return response;
  }
};
