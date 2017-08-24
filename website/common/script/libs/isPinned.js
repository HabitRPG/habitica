module.exports = function isPinned (user, item) {
  if (user === null)
    return false;

  const isItemUnpinned = user.unpinnedItems !== undefined && user.unpinnedItems.findIndex(unpinned => unpinned.path === item.path) > -1;
  const isItemPinned = user.pinnedItems !== undefined && user.pinnedItems.findIndex(pinned => pinned.path === item.path) > -1;

  return isItemPinned && !isItemUnpinned;
};
