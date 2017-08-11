import content from '../content/index';
import getItemInfo from '../libs/getItemInfo';
import get from 'lodash/get';
import { BadRequest } from '../libs/errors';
import i18n from '../i18n';

const officialPinnedItems = content.officialPinnedItems;

/**
 * @returns {boolean} TRUE added the item / FALSE removed it
 */
module.exports = function togglePinnedItem (user, {item, type, path}, req = {}) {
  let arrayToChange;

  if (!path) { // If path isn't passed it means an item was passed
    path = getItemInfo(user, type, item, req.language).path;
  }

  if (!item) item = get(content, path);

  if (path === 'armoire' || path === 'potion') {
    throw new BadRequest(i18n.t('cannotUpinArmoirPotion', req.language));
  }

  let isOfficialPinned = officialPinnedItems.find(officialPinnedItem => {
    return officialPinnedItem.path === path;
  }) !== undefined;

  if (isOfficialPinned) {
    arrayToChange = user.unpinnedItems;
  } else {
    arrayToChange = user.pinnedItems;
  }

  const foundIndex = arrayToChange.findIndex(pinnedItem => {
    return pinnedItem.path === path;
  });

  if (foundIndex >= 0) {
    arrayToChange.splice(foundIndex, 1);
    return isOfficialPinned;
  } else {
    arrayToChange.push({path, type});
    return !isOfficialPinned;
  }
};
