import _ from 'lodash';
import content from '../content/index';
import SeasonalShopConfig from './shops-seasonal.config';

const { officialPinnedItems } = content;

const flatGearArray = _.groupBy(content.gear.flat, 'set');

export default function getOfficialPinnedItems (user) {
  const officialItemsArray = [...officialPinnedItems];

  if (SeasonalShopConfig.pinnedSets && Boolean(user) && user.stats.class) {
    const setToAdd = SeasonalShopConfig.pinnedSets[user.stats.class];

    // pinnedSets == current seasonal class set are always gold purchaseable

    const gearsBySet = flatGearArray[setToAdd];

    for (let i = 0; i < gearsBySet.length; i += 1) {
      const gear = gearsBySet[i];
      if (!user.items.gear.owned[gear.key]) {
        officialItemsArray.push({
          type: 'marketGear',
          path: `gear.flat.${gear.key}`,
        });
      }
    }
  }

  return officialItemsArray;
}
