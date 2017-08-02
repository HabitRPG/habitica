import _findIndex from 'lodash/findIndex';

export default function _isPinned (user, key, type) {
  return _findIndex(user.pinnedItems, {key, type, unpin: false}) >= 0;
}
