import updateStore from '../libs/updateStore';
import getItemInfo from '../libs/getItemInfo';

module.exports = function addPinnedGear (user) {
  if (user.flags.classSelected) {
    let newPinnedItems = updateStore(user);

    for (let item of newPinnedItems) {
      let itemInfo = getItemInfo(user, 'marketGear', item);

      user.pinnedItems.push({
        type: 'marketGear',
        path: itemInfo.path,
      });
    }
  }
};
