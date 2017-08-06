import content from '../content/index';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';

const officialPinnedItems = content.officialPinnedItems;

module.exports = function getPinnedItems (user) {
  const officialPinnedItemsNotUnpinned = officialPinnedItems.filter(officialPin => {
    const isUnpinned = user.unpinnedItems.findIndex(unpinned => unpinned.path === officialPin.path) > -1;
    return !isUnpinned;
  });

  const pinnedItems = user.pinnedItems.concat(officialPinnedItemsNotUnpinned);

  return pinnedItems.map(pinnedItem => {
    return cloneDeep(get(content, pinnedItem.path));
  });
};
