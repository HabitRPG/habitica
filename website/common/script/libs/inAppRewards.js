import content from '../content/index';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import pinning from '../pinning';

const officialPinnedItems = content.officialPinnedItems;

module.exports = function updateStore (user) {
  const itemsPinKeys = user.pinnedItems.concat(officialPinnedItems.filter(officialPin => {
    return user.unpinnedItems.indexOf(officialPin) === -1;
  }));

  return itemsPinKeys.map(itemPinKey => {
    return cloneDeep(get(content, pinning.getItemPathFromPinKey(itemPinKey)));
  });

  // TODO sort
};
