import content from '../content/index';
import getItemInfo from '../libs/getItemInfo';
import get from 'lodash/get';

const officialPinnedItems = content.officialPinnedItems;

module.exports = function togglePinnedItem (user, {item, type, path}, req = {}) {
  let arrayToChange;

  if (!path) { // If path isn't passed it means an item was passed
    path = getItemInfo(user, type, item, req.language).path;
  }

  if (!item) item = get(content, path);

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
  } else {
    arrayToChange.push({path, type});
  }
};
