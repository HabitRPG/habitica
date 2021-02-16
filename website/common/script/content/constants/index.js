import moment from 'moment';

export const CURRENT_SEASON = moment().isBefore('2020-08-02') ? 'summer' : '_NONE_';

export const CLASSES = [
  'warrior',
  'rogue',
  'healer',
  'wizard',
];

export const GEAR_TYPES = [
  'weapon',
  'armor',
  'head',
  'shield',
  'body',
  'back',
  'headAccessory',
  'eyewear',
];

export const USER_CAN_OWN_QUEST_CATEGORIES = [
  'unlockable',
  'gold',
  'hatchingPotion',
  'pet',
];

export { EVENTS } from './events';
export { default as SEASONAL_SETS } from './seasonalSets';
export { default as ANIMAL_COLOR_ACHIEVEMENTS } from './animalColorAchievements';
export { default as ANIMAL_SET_ACHIEVEMENTS } from './animalSetAchievements';
export { default as QUEST_SERIES_ACHIEVEMENTS } from './questSeriesAchievements';
export { default as ITEM_LIST } from './itemList';
