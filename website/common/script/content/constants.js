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
  spring: {
    start: '2014-03-21',
    end: '2014-05-01',
    npcSuffix: '_spring',
    includedEventGear: [
      'spring',
      'spring2015',
      'spring2016',
      'spring2017',
    ],
  },
  summer: {
    start: '2014-06-20',
    end: '2014-08-01',
    npcSuffix: '_summer',
    includedEventGear: [
      'summer',
      'summer2015',
      'summer2016',
    ],
  },
  fall: {
    start: '2014-09-21',
    end: '2014-11-01',
    npcSuffix: '_fall',
    includedEventGear: [
      'fall',
      'fall2015',
      'fall2016',
    ],
  },
  winter: {
    start: '2013-12-31',
    end: '2014-02-01',
    npcSuffix: '_winter',
    includedEventGear: [
      'candycane',
      'ski',
      'snowflake',
      'yeti',
      'winter2015',
      'winter2016',
      'winter2017',
    ],
  },
  birthday: {
    start: '2017-01-31',
    end: '2017-02-02',
    npcSuffix: '_birthday',
    includedEventGear: [
      'birthday',
      'birthday2015',
      'birthday2016',
      'birthday2017',
    ],
  },
  gaymerx: {
    start: '2016-09-29',
    end: '2016-10-03',
    includedEventGear: [
      'gaymerx',
    ],
  },
  nye: {
    start: '2016-12-20',
    end: '2017-01-02',
    npcSuffix: '_nye',
    includedEventGear: [
      'nye',
      'nye2015',
      'nye2016',
      'nye2017',
    ],
  },
  valentines: {
    start: '2017-02-01',
    end: '2017-02-28',
    npcSuffix: '_valentines',
  },
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
  premiumHatchingPotions: { localeKey: 'hatchingPotion', isEquipment: false },
  eggs:            { localeKey: 'eggSingular',    isEquipment: false },
  quests:          { localeKey: 'quest',          isEquipment: false },
  food:            { localeKey: 'foodText',       isEquipment: false },
  Saddle:          { localeKey: 'foodSaddleText', isEquipment: false },
  bundles:         { localeKey: 'discountBundle', isEquipment: false },
};

export const USER_CAN_OWN_QUEST_CATEGORIES = [
  'unlockable',
  'gold',
  'pet',
];
