import content from '../content/index';
import i18n from '../i18n';
import {
  BadRequest,
} from '../libs/errors';
import _ from 'lodash';

module.exports = function openMysteryItem (user, req = {}, analytics) {
  let item = user.purchased.plan.mysteryItems.shift();

  if (!item) {
    throw new BadRequest(i18n.t('mysteryItemIsEmpty', req.language));
  }

  item = _.cloneDeep(content.gear.flat[item]);
  item.notificationType = 'Mystery';
  user.items.gear.owned[item.key] = true;

  user.markModified('purchased.plan.mysteryItems');

  if (analytics) {
    analytics.track('open mystery item', {
      uuid: user._id,
      itemKey: item,
      itemType: 'Subscriber Gear',
      acquireMethod: 'Subscriber',
      category: 'behavior',
    });
  }

  if (typeof window !== 'undefined') {
    if (!user._tmp) user._tmp = {};
    user._tmp.drop = item;
  }

  if (req.v2 === true) {
    return user.items.gear.owned;
  } else {
    return {
      message: i18n.t('mysteryItemOpened', req.language),
      data: user.items.gear.owned,
    };
  }
};
