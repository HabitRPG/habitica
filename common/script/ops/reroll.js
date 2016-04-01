import i18n from '../i18n';
import _ from 'lodash';

module.exports = function reroll (model, req, cb = () => {}, analytics) {
  let user = model.user;
  let tasks = model.tasks;

  if (user.balance < 1) {
    return cb({
      code: 401,
      message: i18n.t('notEnoughGems', req.language),
    });
  }
  user.balance--;
  _.each(tasks, (task) => {
    if (task.type !== 'reward') {
      task.value = 0;
    }
  });
  user.stats.hp = 50;
  if (analytics) {
    analytics.track('Fortify Potion', {
      uuid: user._id,
      acquireMethod: 'Gems',
      gemCost: 4,
      category: 'behavior',
    });
  }
  cb(null, user);
};
