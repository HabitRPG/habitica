import each from 'lodash/each';
import i18n from '../i18n';
import {
  NotAuthorized,
} from '../libs/errors';
import updateUserBalance from './updateUserBalance';

export default async function reroll (user, tasks = [], req = {}, analytics) {
  if (user.balance < 1) {
    throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
  }

  await updateUserBalance(user, -1, 'reroll');
  user.stats.hp = 50;

  each(tasks, task => {
    if (!task.challenge || !task.challenge.id || task.challenge.broken) {
      if (task.type !== 'reward') {
        task.value = 0;
      }
    }
  });

  if (analytics) {
    analytics.track('Fortify Potion', {
      uuid: user._id,
      currency: 'Gems',
      gemCost: 4,
      category: 'behavior',
      headers: req.headers,
    });
  }

  return [
    { user, tasks },
    i18n.t('fortifyComplete'),
  ];
}
