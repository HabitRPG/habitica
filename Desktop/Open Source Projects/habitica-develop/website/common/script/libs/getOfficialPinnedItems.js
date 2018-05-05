import content from '../content/index';
import SeasonalShopConfig from '../libs/shops-seasonal.config';
import toArray from 'lodash/toArray';

const officialPinnedItems = content.officialPinnedItems;

let flatGearArray = toArray(content.gear.flat);

module.exports = function getOfficialPinnedItems (user) {
  let officialItemsArray = [...officialPinnedItems];

  if (SeasonalShopConfig.pinnedSets && Boolean(user) && user.stats.class) {
    let setToAdd = SeasonalShopConfig.pinnedSets[user.stats.class];

    // pinnedSets == current seasonal class set are always gold purchaseable

    flatGearArray.filter((gear) => {
      return user.items.gear.owned[gear.key] === undefined && gear.set === setToAdd;
    }).map((gear) => {
      officialItemsArray.push({
        type: 'marketGear',
        path: `gear.flat.${gear.key}`,
      });
    });
  }

  return officialItemsArray;
};
