import i18n from '../i18n';
import _ from 'lodash';
import splitWhitespace from '../libs/splitWhitespace';
import dotSet from '../libs/dotSet';
import {
  NotAuthorized,
  BadRequest,
} from '../libs/errors';

module.exports = function unlock (user, req = {}, analytics) {
  let path = _.get(req.query, 'path');

  if (!path) {
    throw new BadRequest(i18n.t('pathRequired', req.language));
  }

  let isFullSet = path.indexOf(',') !== -1;
  let cost;
  let isBackground = path.indexOf('background.') !== -1;

  if (isBackground && isFullSet) {
    cost = 3.75;
  } else if (isBackground) {
    cost = 1.75;
  } else if (isFullSet) {
    cost = 1.25;
  } else {
    cost = 0.5;
  }

  let alreadyOwns = !isFullSet && user.fns.dotGet(`purchased.${path}`) === true;

  if ((!user.balance || user.balance < cost) && !alreadyOwns) {
    throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
  }

  if (isFullSet) {
    _.each(path.split(','), function markItemsAsPurchased (pathPart) {
      if (path.indexOf('gear.') !== -1) {
        dotSet(user, pathPart, true);
        return true;
      }

      dotSet(user, `purchased.${pathPart}`, true);
      return true;
    });
  } else {
    if (alreadyOwns) {
      let split = path.split('.');
      let value = split.pop();
      let key = split.join('.');
      if (key === 'background' && value === user.preferences.background) {
        value = '';
      }
      dotSet(user, `preferences.${key}`, value);

      throw new NotAuthorized(i18n.t('alreadyUnlocked', req.language));
    }
    dotSet(user, `purchased.${path}`, true);
  }

  if (path.indexOf('gear.') === -1) {
    user.markModified('purchased');
  }

  user.balance -= cost;

  if (analytics) {
    analytics.track('acquire item', {
      uuid: user._id,
      itemKey: path,
      itemType: 'customization',
      acquireMethod: 'Gems',
      gemCost: cost / 0.25,
      category: 'behavior',
    });
  }

  let response = {
    data: _.pick(user, splitWhitespace('purchased preferences items')),
    message: i18n.t('unlocked'),
  };

  return response;
};
