import getItemInfo from './getItemInfo';
import shops from './shops';
import getOfficialPinnedItems from './getOfficialPinnedItems';

import getItemByPathAndType from './getItemByPathAndType';

module.exports = function getPinnedItems (user) {
  let officialPinnedItems = getOfficialPinnedItems(user);

  const officialPinnedItemsNotUnpinned = officialPinnedItems.filter(officialPin => {
    const isUnpinned = user.unpinnedItems.findIndex(unpinned => unpinned.path === officialPin.path) > -1;
    return !isUnpinned;
  });

  const pinnedItems = officialPinnedItemsNotUnpinned.concat(user.pinnedItems);

  let items = pinnedItems.map(({type, path}) => {
    let item = getItemByPathAndType(type, path);

    return getItemInfo(user, type, item, officialPinnedItems);
  });

  shops.checkMarketGearLocked(user, items);

  return items;
};
