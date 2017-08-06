import content from '../content/index';

const officialPinnedItems = content.officialPinnedItems;

module.exports = function togglePinnedItem (user, {path, type}) {
  let arrayToChange;
  let isOfficialPinned = officialPinnedItems.find((item) => {
    return item.path === path;
  }) !== undefined;

  if (isOfficialPinned) {
    arrayToChange = user.unpinnedItems;
  } else {
    arrayToChange = user.pinnedItems;
  }

  const foundIndex = arrayToChange.findIndex(item => {
    return item.path === path;
  });

  if (foundIndex >= 0) {
    arrayToChange.splice(foundIndex, 1);
  } else {
    arrayToChange.push({path, type});
  }
};
