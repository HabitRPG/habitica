import updateStore from '../libs/updateStore';
import getItemInfo from '../libs/getItemInfo';

module.exports = function removePinnedGear (user) {
  if (user.flags.classSelected) {
    let currentPinnedItems = updateStore(user);

    for (let item of currentPinnedItems) {
      let itemInfo = getItemInfo(user, 'marketGear', item);

      const foundIndex = user.pinnedItems.findIndex(pinnedItem => {
        return pinnedItem.path === itemInfo.path;
      });

      if (foundIndex >= 0) {
        user.pinnedItems.splice(foundIndex, 1);
      }
    }
  }
};
