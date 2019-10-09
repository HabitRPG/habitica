import compactArray from 'lodash/compact';
import getItemInfo from './getItemInfo';
import shops from './shops';
import getOfficialPinnedItems from './getOfficialPinnedItems';

import getItemByPathAndType from './getItemByPathAndType';
import { checkPinnedAreasForNullEntries } from '../ops/pinnedGearUtils';

/**
 * Orders the pinned items so we always get our inAppRewards in the order
 * which the user has saved
 *
 * @param user is the user
 * @param items is the combined list of pinned items to sort
 * @return items of ordered inAppRewards
 */
function sortInAppRewards (user, items) {
  const { pinnedItemsOrder } = user;
  let orderedItems = [];
  const unorderedItems = []; // what we want to add later

  items.forEach((item, index) => {
    const i = pinnedItemsOrder[index] === item.path ? index : pinnedItemsOrder.indexOf(item.path);
    if (i === -1) {
      unorderedItems.push(item);
    } else {
      orderedItems[i] = item;
    }
  });
  orderedItems = compactArray(orderedItems);
  orderedItems = unorderedItems.concat(orderedItems);
  return orderedItems;
}

export default function getPinnedItems (user) {
  checkPinnedAreasForNullEntries(user);

  const officialPinnedItems = getOfficialPinnedItems(user);

  const officialPinnedItemsNotUnpinned = officialPinnedItems.filter(officialPin => {
    const isUnpinned = user.unpinnedItems
      .findIndex(unpinned => unpinned.path === officialPin.path) > -1;
    return !isUnpinned;
  });

  const pinnedItems = officialPinnedItemsNotUnpinned.concat(user.pinnedItems);

  const items = pinnedItems
    .map(({ type, path }) => {
      const item = getItemByPathAndType(type, path);

      return getItemInfo(user, type, item, officialPinnedItems);
    });

  shops.checkMarketGearLocked(user, items);

  const orderedItems = sortInAppRewards(user, items);
  return orderedItems;
}
