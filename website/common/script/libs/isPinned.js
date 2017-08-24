module.exports = function isPinned (user, item) {
  if (user === null)
    return false;

  const isUnpinned = user.unpinnedItems.findIndex(unpinned => unpinned.path === item.path) > -1;
  const pinnedItem = user.pinnedItems.findIndex(pinned => pinned.path === item.path) > -1;

  return pinnedItem && !isUnpinned;
};
