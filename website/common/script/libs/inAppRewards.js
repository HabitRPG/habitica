import content from '../content/index';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';

const officialPinnedItems = content.officialPinnedItems;

module.exports = function updateStore (user) {
  const itemsKeys = user.pinnedItems.concat(officialPinnedItems.filter(officialPin => {
    return user.unpinnedItems.indexOf(officialPin) === -1;
  }));

  return itemsKeys.map(itemKey => {
    const item = cloneDeep(get(content, itemKey));
    item.fullPath = itemKey;
    return item;
  });

  // TODO sort
};
