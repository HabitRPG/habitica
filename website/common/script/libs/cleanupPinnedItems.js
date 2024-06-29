import getItemByPathAndType from './getItemByPathAndType';
import { getAllScheduleMatchingGroups } from '../content/constants/schedule';

const simpleSeasonalPins = [
  'background',
  'premiumHatchingPotion',
  'mystery_set',
  'bundles',
  'seasonalQuest',
];

const detailSeasonalPins = [
  'quests',
  'gear',
];

export default function cleanupPinnedItems (user) {
  const matchers = getAllScheduleMatchingGroups();

  const items = user.pinnedItems
    .filter(pinnedItem => {
      const { type } = pinnedItem;
      const key = pinnedItem.path.split('.').slice(-1)[0];
      if (simpleSeasonalPins.indexOf(type) !== -1) {
        if (type === 'background') {
          return matchers.backgrounds.match(pinnedItem.path.split('.')[1]);
        } if (type === 'premiumHatchingPotion') {
          return matchers.premiumHatchingPotions.match(key);
        } if (type === 'mystery_set') {
          return matchers.timeTravelers.match(key);
        } if (type === 'seasonalQuest') {
          return matchers.seasonalQuests.match(key);
        }
        return matchers[type].match(key);
      } if (detailSeasonalPins.indexOf(type) !== -1) {
        const item = getItemByPathAndType(type, pinnedItem.path);
        if (type === 'gear' && item.klass === 'special') {
          return matchers.seasonalGear.match(item.set);
        } if (type === 'quests' && item.category === 'pet') {
          return matchers.petQuests.match(item.key);
        } if (type === 'quests' && item.category === 'hatchingPotion') {
          return matchers.hatchingPotionQuests.match(item.key);
        }
        return true;
      }
      return true;
    });

  return items;
}
