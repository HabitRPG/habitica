import moment from 'moment';
import { EVENTS, getScheduleMatchingGroup } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',

// hatching potions and food names should be capitalized lest you break the market
const featuredItems = {
  market () {
    const featured = [{
      type: 'armoire',
      path: 'armoire',
    }];
    const itemKeys = getScheduleMatchingGroup('premiumHatchingPotions').items;
    itemKeys.forEach(itemKey => {
      if (featured.length < 4) {
        featured.push({
          type: 'premiumHatchingPotion',
          path: `premiumHatchingPotions.${itemKey}`,
        });
      }
    });
    return featured;
  },
  quests () {
    const featured = [];
    const bundleKeys = getScheduleMatchingGroup('bundles').items;
    bundleKeys.forEach(itemKey => {
      featured.push({
        type: 'bundles',
        path: `bundles.${itemKey}`,
      });
    });
    const petQuestKeys = getScheduleMatchingGroup('petQuests').items;
    petQuestKeys.forEach(itemKey => {
      if (featured.length < 4) {
        featured.push({
          type: 'quests',
          path: `quests.${itemKey}`,
        });
      }
    });
    return featured;
  },
  seasonal: 'spring2019CloudRogueSet',
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
