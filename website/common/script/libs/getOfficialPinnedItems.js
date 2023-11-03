import content from '../content/index';
import SeasonalShopConfig from './shops-seasonal.config';

const { officialPinnedItems } = content;

function groupBySet (items) {
  const grouped = {};

  Object.keys(items).forEach(key => {
    const item = items[key];
    const { set } = item;

    if (!grouped[set]) {
      grouped[set] = [];
    }

    grouped[set].push(item);
  });

  return grouped;
}

const flatGearArray = groupBySet(content.gear.flat);

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
