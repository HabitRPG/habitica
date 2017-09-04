import content from '../content/index';
import get from 'lodash/get';
import getItemInfo from './getItemInfo';
import shops from './shops';
import getOfficialPinnedItems from './getOfficialPinnedItems';


module.exports = function getPinnedItems (user) {
  let officialPinnedItems = getOfficialPinnedItems(user);

  const officialPinnedItemsNotUnpinned = officialPinnedItems.filter(officialPin => {
    const isUnpinned = user.unpinnedItems.findIndex(unpinned => unpinned.path === officialPin.path) > -1;
    return !isUnpinned;
  });

  const pinnedItems = officialPinnedItemsNotUnpinned.concat(user.pinnedItems);

  let items = pinnedItems.map(({type, path}) => {
    return getItemInfo(user, type, get(content, path), officialPinnedItems);
  });

  shops.checkMarketGearLocked(user, items);

  return items;
};
