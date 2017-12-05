import i18n from '../i18n';
import get from 'lodash/get';
import each from 'lodash/each';
import pick from 'lodash/pick';
import setWith from 'lodash/setWith';
import splitWhitespace from '../libs/splitWhitespace';
import {
  NotAuthorized,
  BadRequest,
} from '../libs/errors';

import { removeItemByPath } from './pinnedGearUtils';
import getItemInfo from '../libs/getItemInfo';
import content from '../content/index';

// If item is already purchased -> equip it
// Otherwise unlock it
module.exports = function unlock (user, req = {}, analytics) {
  let path = get(req.query, 'path');

  if (!path) {
    throw new BadRequest(i18n.t('pathRequired', req.language));
  }

  let isFullSet = path.indexOf(',') !== -1;
  let isBackground = path.indexOf('background.') !== -1;

  let cost;
  if (isBackground && isFullSet) {
    cost = 3.75;
  } else if (isBackground) {
    cost = 1.75;
  } else if (isFullSet) {
    cost = 1.25;
  } else {
    cost = 0.5;
  }

  let setPaths;
  let alreadyOwns;

  if (isFullSet) {
    setPaths = path.split(',');
    let alreadyOwnedItems = 0;

    each(setPaths, singlePath => {
      if (get(user, `purchased.${singlePath}`) === true) {
        alreadyOwnedItems++;
      }
    });

    if (alreadyOwnedItems === setPaths.length) {
      throw new NotAuthorized(i18n.t('alreadyUnlocked', req.language));
    // TODO write math formula to check if buying the full set is cheaper than the items individually
    // (item cost * number of remaining items) < setCost`
    } /* else if (alreadyOwnedItems > 0) {
      throw new NotAuthorized(i18n.t('alreadyUnlockedPart', req.language));
    } */
  } else {
    alreadyOwns = get(user, `purchased.${path}`) === true;
  }

  if (isBackground && !alreadyOwns && (path.indexOf('.blue') !== -1 || path.indexOf('.green') !== -1 || path.indexOf('.red') !== -1 || path.indexOf('.purple') !== -1 || path.indexOf('.yellow') !== -1)) {
    throw new BadRequest(i18n.t('incentiveBackgroundsUnlockedWithCheckins'));
  }

  if ((!user.balance || user.balance < cost) && !alreadyOwns) {
    throw new NotAuthorized(i18n.t('notEnoughGems', req.language));
  }

  if (isFullSet) {
    each(setPaths, function markItemsAsPurchased (pathPart) {
      if (path.indexOf('gear.') !== -1) {
        // Using Object so path[1] won't create an array but an object {path: {1: value}}
        setWith(user, pathPart, true, Object);
      }

      // Using Object so path[1] won't create an array but an object {path: {1: value}}
      setWith(user, `purchased.${pathPart}`, true, Object);
    });
  } else {
    let split = path.split('.');
    let value = split.pop();
    let key = split.join('.');

    if (alreadyOwns) { // eslint-disable-line no-lonely-if
      if (key === 'background' && value === user.preferences.background) {
        value = '';
      }

      // Using Object so path[1] won't create an array but an object {path: {1: value}}
      setWith(user, `preferences.${key}`, value, Object);
    } else {
      if (path.indexOf('gear.') !== -1) {
        // Using Object so path[1] won't create an array but an object {path: {1: value}}
        setWith(user, path, true, Object);
      }
      // Using Object so path[1] won't create an array but an object {path: {1: value}}
      setWith(user, `purchased.${path}`, true, Object);

      // @TODO: Test and check test coverage
      if (isBackground) {
        let backgroundContent = content.backgroundsFlat[value];
        let itemInfo = getItemInfo(user, 'background', backgroundContent);
        removeItemByPath(user, itemInfo.path);
      }
    }
  }

  if (!alreadyOwns) {
    if (path.indexOf('gear.') === -1) {
      if (user.markModified) user.markModified('purchased');
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
        headers: req.headers,
      });
    }
  }

  let response = [
    pick(user, splitWhitespace('purchased preferences items')),
  ];

  if (!alreadyOwns) response.push(i18n.t('unlocked', req.language));

  return response;
};
