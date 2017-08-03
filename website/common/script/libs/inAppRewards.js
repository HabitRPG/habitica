import content from '../content/index';

const officialPinnedItems = content.officialPinnedItems;

module.exports = function updateStore (user) {
  const itemsKeys = user.pinnedItems.concat(officialPinnedItems.filter(officialPin => {
    return user.unpinnedItems.indexOf(officialPin) === -1;
  }));

  // TODO map item key to item data in content
  return itemsKeys.map(itemKey => {
    return itemKey;
  });

  // TODO sort
};
