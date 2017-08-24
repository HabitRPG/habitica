import content from '../content/index';
import get from 'lodash/get';
import getItemInfo from './getItemInfo';
import shops from './shops';

const officialPinnedItems = content.officialPinnedItems;

module.exports = function getPinnedItems (user) {
  const officialPinnedItemsNotUnpinned = officialPinnedItems.filter(officialPin => {
    const isUnpinned = user.unpinnedItems.findIndex(unpinned => unpinned.path === officialPin.path) > -1;
    return !isUnpinned;
  });

  const pinnedItems = officialPinnedItemsNotUnpinned.concat(user.pinnedItems);

  let items = pinnedItems.map(({type, path}) => {
    return getItemInfo(user, type, get(content, path));
  });

  shops.checkMarketGearLocked(user, items);

  return items;
};
