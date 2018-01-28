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
  birthday:   { start: '2017-01-31', end: '2017-02-02' },
  spring:     { start: '2014-03-21', end: '2014-05-01' },
  summer:     { start: '2014-06-20', end: '2014-08-01' },
  fall:       { start: '2014-09-21', end: '2014-11-01' },
  winter2015: { start: '2014-12-21', end: '2015-02-02' },
  spring2015: { start: '2015-03-20', end: '2015-05-02' },
  summer2015: { start: '2015-06-20', end: '2015-08-02' },
  fall2015:   { start: '2015-09-21', end: '2015-11-01' },
  gaymerx:    { start: '2016-09-29', end: '2016-10-03' },
  winter2016: { start: '2015-12-18', end: '2016-02-02' },
  spring2016: { start: '2016-03-18', end: '2016-05-02' },
  summer2016: { start: '2016-06-21', end: '2016-08-02' },
  fall2016:   { start: '2016-09-20', end: '2016-11-02' },
  winter2017: { start: '2016-12-16', end: '2017-02-02' },
  spring2017: { start: '2017-03-21', end: '2017-05-02' },
  summer2017: { start: '2017-06-20', end: '2017-08-02' },
  fall2017:   { start: '2017-09-21', end: '2017-11-02' },
  winter2018: { start: '2017-12-19', end: '2018-02-02' },
};

export const SEASONAL_SETS = {
  winter: [
    // winter 2014
    'candycaneSet',
    'skiSet',
    'snowflakeSet',
    'yetiSet',

    // winter 2015
    'northMageSet',
    'icicleDrakeSet',
    'soothingSkaterSet',
    'gingerbreadSet',

    // winter 2016
    'snowDaySet',
    'snowboardingSet',
    'festiveFairySet',
    'cocoaSet',

    // winter 2017
    'winter2017IceHockeySet',
    'winter2017WinterWolfSet',
    'winter2017SugarPlumSet',
    'winter2017FrostyRogueSet',

    // winter 2018
    'winter2018ConfettiSet',
    'winter2018GiftWrappedSet',
    'winter2018MistletoeSet',
    'winter2018ReindeerSet',
  ],
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
