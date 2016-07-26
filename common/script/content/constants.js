/* eslint-disable key-spacing */

export const CLASSES = [
  'warrior',
  'rogue',
  'healer',
  'wizard',
];

// IMPORTANT: The end date should be one to two days AFTER the actual end of
// the event, to allow people in different timezones to still buy the
// event gear up until at least the actual end of the event.

export const EVENTS = {
  winter:     { start: '2013-12-31', end: '2014-02-01' },
  birthday:   { start: '2016-01-29', end: '2016-02-02' },
  spring:     { start: '2014-03-21', end: '2014-05-01' },
  summer:     { start: '2014-06-20', end: '2014-08-01' },
  fall:       { start: '2014-09-21', end: '2014-11-01' },
  winter2015: { start: '2014-12-21', end: '2015-02-02' },
  spring2015: { start: '2015-03-20', end: '2015-05-02' },
  summer2015: { start: '2015-06-20', end: '2015-08-02' },
  fall2015:   { start: '2015-09-21', end: '2015-11-01' },
  gaymerx:    { start: '2015-12-01', end: '2015-12-14' },
  winter2016: { start: '2015-12-18', end: '2016-02-02' },
  spring2016: { start: '2016-03-18', end: '2016-05-02' },
  summer2016: { start: '2016-06-21', end: '2016-08-02' },
};

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

export const ITEM_LIST = {
  weapon:          { localeKey: 'weapon',         isEquipment: true  },
  armor:           { localeKey: 'armor',          isEquipment: true  },
  head:            { localeKey: 'headgear',       isEquipment: true  },
  shield:          { localeKey: 'offhand',        isEquipment: true  },
  back:            { localeKey: 'back',           isEquipment: true  },
  body:            { localeKey: 'body',           isEquipment: true  },
  headAccessory:   { localeKey: 'headAccessory',  isEquipment: true  },
  eyewear:         { localeKey: 'eyewear',        isEquipment: true  },
  hatchingPotions: { localeKey: 'hatchingPotion', isEquipment: false },
  eggs:            { localeKey: 'eggSingular',    isEquipment: false },
  quests:          { localeKey: 'quest',          isEquipment: false },
  food:            { localeKey: 'foodText',       isEquipment: false },
  Saddle:          { localeKey: 'foodSaddleText', isEquipment: false },
};

export const USER_CAN_OWN_QUEST_CATEGORIES = [
  'unlockable',
  'gold',
  'pet',
];
