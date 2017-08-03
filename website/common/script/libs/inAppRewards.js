import content from '../content/index';
import get from 'lodash/get';

const officialPinnedItems = content.officialPinnedItems;

module.exports = function updateStore (user) {
  const itemsKeys = user.pinnedItems.concat(officialPinnedItems.filter(officialPin => {
    return user.unpinnedItems.indexOf(officialPin) === -1;
  }));

  return itemsKeys.map(itemKey => {
    return get(content, itemKey);
  });

  // TODO sort
};
