import content from '../content/index';
import { removeFromArray } from '../../../server/libs/collectionManipulators';

const officialPinnedItems = content.officialPinnedItems;

module.exports = function togglePinnedItem (user, key) {
  let arrayToChange = [];
  let isOfficialPinned = officialPinnedItems.indexOf(key) >= 0;

  if (isOfficialPinned) {
    arrayToChange = user.unpinnedItems;
  } else {
    arrayToChange = user.pinnedItems;
  }

  let foundIndex = arrayToChange.indexOf(key);

  if (foundIndex >= 0) {
    removeFromArray(arrayToChange, key);
  } else {
    arrayToChange.push(key);
  }
};
