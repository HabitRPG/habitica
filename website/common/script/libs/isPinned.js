
module.exports = function isPinned (user, item, checkOfficialPinnedItems /* getOfficialPinnedItems */) {
  if (user === null)
    return false;

  const isPinnedOfficial = checkOfficialPinnedItems !== undefined && checkOfficialPinnedItems.findIndex(pinned => pinned.path === item.path) > -1;
  const isItemUnpinned = user.unpinnedItems !== undefined && user.unpinnedItems.findIndex(unpinned => unpinned.path === item.path) > -1;
  const isItemPinned = user.pinnedItems !== undefined && user.pinnedItems.findIndex(pinned => pinned.path === item.path) > -1;

  if (isPinnedOfficial && !isItemUnpinned)
    return true;

  return isItemPinned;
};
