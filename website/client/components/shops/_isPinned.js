export default function _isPinned (user, item) {
  const isUnpinned = user.unpinnedItems.findIndex(unpinned => unpinned.path === item.path) > -1;
  const isPinned = user.pinnedItems.findIndex(pinned => pinned.path === item.path) > -1;

  return isPinned && !isUnpinned;
}
