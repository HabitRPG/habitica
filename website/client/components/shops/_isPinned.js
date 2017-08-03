export default function _isPinned (user, key) {
  let result = user.pinnedItems.includes(key) && !user.unpinnedItems.includes(key);

  return result;
}
