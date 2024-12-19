import { getScheduleMatchingGroup } from './constants';
// Magic Hatching Potions are configured like this:
// type: 'premiumHatchingPotion',  // note no "s" at the end
// path: 'premiumHatchingPotions.Rainbow',

const potentialFeaturedPetQuests = [
  'nudibranch',
  'yarn',

  'slime',
  'cat',

  'frog',

  'monkey',

  'sloth',

  'hippo',
  'giraffe',

  'guineapig',
  'chameleon',

  'cheetah',
  'crab',

  'beetle',
  'raccoon',

  'snail',
  'dog',

  'kangaroo',
  'owl',

  'ghost_stag',
  'sabretooth',
];

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
    const petQuestKeys = getScheduleMatchingGroup('petQuests').items;
    petQuestKeys.forEach(itemKey => {
      if (potentialFeaturedPetQuests.includes(itemKey)) {
        featured.push({
          type: 'quests',
          path: `quests.${itemKey}`,
        });
      }
    });
    const hatchingPotionQuests = getScheduleMatchingGroup('hatchingPotionQuests').items;
    hatchingPotionQuests.forEach(itemKey => {
      featured.push({
        type: 'quests',
        path: `quests.${itemKey}`,
      });
    });
    return featured;
  },
  seasonal () {
    const featured = [];
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
  timeTravelers: [
    // TODO
  ],
};

export default featuredItems;
