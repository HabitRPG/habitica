import moment from 'moment';
import SEASONAL_SETS from './seasonalSets';
import { getRepeatingEvents } from './events';

function backgroundMatcher (month1, month2, oddYear) {
  return function call (key) {
    const keyLength = key.length;
    const month = parseInt(key.substring(keyLength - 6, keyLength - 4), 10);
    return (month === month1 || month === month2)
        && parseInt(key.substring(keyLength - 2, keyLength), 10) % 2 === (oddYear ? 1 : 0);
  };
}

function timeTravelersMatcher (month1, month2) {
  return function call (item) {
    const itemMonth = parseInt(item.substring(4, 6), 10);
    return itemMonth === month1 || itemMonth === month2;
  };
}

function inListMatcher (list) {
  return function call (item) {
    return list.indexOf(item) !== -1;
  };
}

const ALWAYS_AVAILABLE_CUSTOMIZATIONS = [
  'animalSkins',
  'rainbowSkins',
  'rainbowHairColors',
  'specialShirts',
  'facialHair',
  'baseHair1',
  'baseHair2',
  'baseHair3',
];

function customizationMatcher (list) {
  return function call (item) {
    if (ALWAYS_AVAILABLE_CUSTOMIZATIONS.indexOf(item) !== -1) {
      return true;
    }
    return list.indexOf(item) !== -1;
  };
}

export const FIRST_RELEASE_DAY = 1;
export const SECOND_RELEASE_DAY = 7;
export const THIRD_RELEASE_DAY = 14;
export const FOURTH_RELEASE_DAY = 21;

export const MONTHLY_SCHEDULE = {
  0: {
    [FIRST_RELEASE_DAY]: [
      {
        type: 'timeTravelers',
        matcher: timeTravelersMatcher(1, 7),
      },
    ],
    [SECOND_RELEASE_DAY]: [
      {
        type: 'backgrounds',
        matcher: backgroundMatcher(1, 7, false),
      },
    ],
    [THIRD_RELEASE_DAY]: [
      {
        type: 'petQuests',
        items: [
          'nudibranch',
          'seaserpent',
          'gryphon',
          'yarn',
          'axolotl',
        ],
      },
      {
        type: 'hatchingPotionQuests',
        items: [
          'silver',
        ],
      },
      {
        type: 'bundles',
        items: [
          'winterQuests',
        ],
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        items: [
          'Aurora',
          'Moonglow',
          'IcySnow',
        ],
      },
    ],
  },
  1: {
    [FIRST_RELEASE_DAY]: [
      {
        type: 'timeTravelers',
        matcher: timeTravelersMatcher(2, 8),
      },
    ],
    [SECOND_RELEASE_DAY]: [
      {
        type: 'backgrounds',
        matcher: backgroundMatcher(2, 8, false),
      },
    ],
    [THIRD_RELEASE_DAY]: [
      {
        type: 'petQuests',
        items: [
          'rooster',
          'slime',
          'peacock',
          'bunny',
        ],
      },
      {
        type: 'hatchingPotionQuests',
        items: [
          'pinkMarble',
        ],
      },
      {
        type: 'bundles',
        items: [
          'cuddleBuddies',
        ],
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        items: [
          'PolkaDot',
          'Cupid',
          'RoseGold',
        ],
      },
    ],
  },
  2: {
    [FIRST_RELEASE_DAY]: [
      {
        type: 'timeTravelers',
        matcher: timeTravelersMatcher(3, 9),
      },
    ],
    [SECOND_RELEASE_DAY]: [
      {
        type: 'backgrounds',
        matcher: backgroundMatcher(3, 9, false),
      },
    ],
    [THIRD_RELEASE_DAY]: [
      {
        type: 'petQuests',
        items: [
          'frog',
          'spider',
          'cow',
          'pterodactyl',
        ],
      },
      {
        type: 'hatchingPotionQuests',
        items: [
        ],
      },
      {
        type: 'bundles',
        items: [
          'birdBuddies',
        ],
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        items: [
          'Birch',
          'StainedGlass',
          'Porcelain',
        ],
      },
    ],
  },
  3: {
    [FIRST_RELEASE_DAY]: [
      {
        type: 'timeTravelers',
        matcher: timeTravelersMatcher(4, 10),
      },
    ],
    [SECOND_RELEASE_DAY]: [
      {
        type: 'backgrounds',
        matcher: backgroundMatcher(4, 10, false),
      },
    ],
    [THIRD_RELEASE_DAY]: [
      {
        type: 'petQuests',
        items: [
          'snake',
          'monkey',
          'falcon',
          'aligator',
        ],
      },
      {
        type: 'hatchingPotionQuests',
        items: [
          'mossyStone',
        ],
      },
      {
        type: 'bundles',
        items: [
          'hugabug',
        ],
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        items: [
          'Shimmer',
          'Glass',
        ],
      },
    ],
  },
  4: {
    [FIRST_RELEASE_DAY]: [
      {
        type: 'timeTravelers',
        matcher: timeTravelersMatcher(5, 11),
      },
    ],
    [SECOND_RELEASE_DAY]: [
      {
        type: 'backgrounds',
        matcher: backgroundMatcher(5, 11, false),
      },
    ],
    [THIRD_RELEASE_DAY]: [
      {
        type: 'petQuests',
        items: [
          'octopus',
          'horse',
          'kraken',
          'sloth',
        ],
      },
      {
        type: 'hatchingPotionQuests',
        items: [
        ],
      },
      {
        type: 'bundles',
        items: [
          'splashyPals',
        ],
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        items: [
          'Floral',
          'Fairy',
          'RoseQuartz',
        ],
      },
    ],
  },
  5: {
    [FIRST_RELEASE_DAY]: [
      {
        type: 'timeTravelers',
        matcher: timeTravelersMatcher(6, 12),
      },
    ],
    [SECOND_RELEASE_DAY]: [
      {
        type: 'backgrounds',
        matcher: backgroundMatcher(6, 12, false),
      },
    ],
    [THIRD_RELEASE_DAY]: [
      {
        type: 'petQuests',
        items: [
          'trex',
          'unicorn',
          'veolociraptor',
          'hippo',
        ],
      },
      {
        type: 'hatchingPotionQuests',
        items: [
          'turquiose',
        ],
      },
      {
        type: 'bundles',
        items: [
          'rockingReptiles',
        ],
      },
      {
        type: 'bundles',
        items: [
          'delightfulDinos',
        ],
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        items: [
          'Rainbow',
          'Sunshine',
        ],
      },
    ],
  },
  6: {
    [FIRST_RELEASE_DAY]: [
      {
        type: 'timeTravelers',
        matcher: timeTravelersMatcher(7, 1),
      },
    ],
    [SECOND_RELEASE_DAY]: [
      {
        type: 'backgrounds',
        matcher: backgroundMatcher(7, 1, true),
      },
    ],
    [THIRD_RELEASE_DAY]: [
      {
        type: 'petQuests',
        items: [
          'whale',
          'seahorse',
          'armadillo',
          'guineapig',
        ],
      },
      {
        type: 'hatchingPotionQuests',
        items: [
          'fluorite',
        ],
      },
      {
        type: 'bundles',
        items: [
          'winterQuests',
        ],
      },
      {
        type: 'bundles',
        items: [
          'aquaticAmigos',
        ],
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        items: [
          'Celestial',
          'SandCastle',
          'Watery',
        ],
      },
    ],
  },
  7: {
    [FIRST_RELEASE_DAY]: [
      {
        type: 'timeTravelers',
        matcher: timeTravelersMatcher(8, 2),
      },
    ],
    [SECOND_RELEASE_DAY]: [
      {
        type: 'backgrounds',
        matcher: backgroundMatcher(8, 2, true),
      },
    ],
    [THIRD_RELEASE_DAY]: [
      {
        type: 'petQuests',
        items: [
          'turtle',
          'penguin',
          'butterfly',
          'cheetah',
        ],
      },
      {
        type: 'hatchingPotionQuests',
        items: [
          'blackPearl',
        ],
      },
      {
        type: 'bundles',
        items: [
          'featheredFriends',
        ],
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        items: [
          'Aquatic',
          'StarryNight',
          'Sunset',
        ],
      },
    ],
  },
  8: {
    [FIRST_RELEASE_DAY]: [
      {
        type: 'timeTravelers',
        matcher: timeTravelersMatcher(9, 3),
      },
    ],
    [SECOND_RELEASE_DAY]: [
      {
        type: 'backgrounds',
        matcher: backgroundMatcher(9, 3, true),
      },
    ],
    [THIRD_RELEASE_DAY]: [
      {
        type: 'petQuests',
        items: [
          'squirrel',
          'triceratops',
          'treeling',
          'beetle',
        ],
      },
      {
        type: 'hatchingPotionQuests',
        items: [
          'bronze',
        ],
      },
      {
        type: 'bundles',
        items: [
          'farmFriends',
        ],
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        items: [
          'Glow',
          'AutumnLeaf',
          'Shadow',
        ],
      },
    ],
  },
  9: {
    [FIRST_RELEASE_DAY]: [
      {
        type: 'timeTravelers',
        matcher: timeTravelersMatcher(10, 4),
      },
    ],
    [SECOND_RELEASE_DAY]: [
      {
        type: 'backgrounds',
        matcher: backgroundMatcher(10, 4, true),
      },
    ],
    [THIRD_RELEASE_DAY]: [
      {
        type: 'petQuests',
        items: [
          'snail',
          'rock',
          'ferret',
          'hedgehog',
        ],
      },
      {
        type: 'hatchingPotionQuests',
        items: [
          'onyx',
        ],
      },
      {
        type: 'bundles',
        items: [
          'witchyFamiliars',
        ],
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        items: [
          'Vampire',
          'Ghost',
          'Spooky',
        ],
      },
    ],
  },
  10: {
    [FIRST_RELEASE_DAY]: [
      {
        type: 'timeTravelers',
        matcher: timeTravelersMatcher(11, 5),
      },
    ],
    [SECOND_RELEASE_DAY]: [
      {
        type: 'backgrounds',
        matcher: backgroundMatcher(11, 5, true),
      },
    ],
    [THIRD_RELEASE_DAY]: [
      {
        type: 'petQuests',
        items: [
          'sheep',
          'kangaroo',
          'owl',
          'rat',
          'badger',
        ],
      },
      {
        type: 'hatchingPotionQuests',
        items: [
          'amber',
        ],
      },
      {
        type: 'bundles',
        items: [
          'forestFriends',
        ],
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        items: [
          'Ember',
          'Frost',
          'Thunderstorm',
        ],
      },
    ],
  },
  11: {
    [FIRST_RELEASE_DAY]: [
      {
        type: 'timeTravelers',
        matcher: timeTravelersMatcher(12, 6),
      },
    ],
    [SECOND_RELEASE_DAY]: [
      {
        type: 'backgrounds',
        matcher: backgroundMatcher(12, 6, true),
      },
    ],
    [THIRD_RELEASE_DAY]: [
      {
        type: 'petQuests',
        items: [
          'ghost_stag',
          'trex_undead',
          'harpy',
          'sabretooth',
          'dolphin',
        ],
      },
      {
        type: 'hatchingPotionQuests',
        items: [
          'ruby',
        ],
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        items: [
          'Peppermint',
          'Holly',
        ],
      },
    ],
  },
};

export const GALA_SWITCHOVER_DAY = 21;
export const GALA_KEYS = [
  'winter',
  'spring',
  'summer',
  'fall',
];
export const GALA_SCHEDULE = {
  0: {
    startMonth: 11,
    endMonth: 1,
    filters: [
      {
        type: 'seasonalGear',
        items: SEASONAL_SETS.winter,
      },
      {
        type: 'seasonalSpells',
        items: [
          'snowball',
        ],
      },
      {
        type: 'seasonalQuests',
        items: [
          'evilsanta',
          'evilsanta2',
        ],
      },
      {
        type: 'customizations',
        matcher: customizationMatcher([
          'winteryHairColors',
          'winterySkins',
        ]),
      },
    ],
  },
  1: {
    startMonth: 2,
    endMonth: 4,
    filters: [
      {
        type: 'seasonalGear',
        items: SEASONAL_SETS.spring,
      },
      {
        type: 'seasonalSpells',
        items: [
          'shinySeed',
        ],
      },
      {
        type: 'seasonalQuests',
        items: [
          'egg',
          'waffle',
        ],
      },
      {
        type: 'customizations',
        matcher: customizationMatcher([
          'shimmerHairColors',
          'pastelSkins',
        ]),
      },
    ],
  },
  2: {
    startMonth: 5,
    endMonth: 7,
    filters: [
      {
        type: 'seasonalGear',
        items: SEASONAL_SETS.summer,
      },
      {
        type: 'seasonalSpells',
        items: [
          'seafoam',
        ],
      },
      {
        type: 'seasonalQuests',
        items: [
        ],
      },
      {
        type: 'customizations',
        matcher: customizationMatcher([
          'splashySkins',
        ]),
      },
    ],
  },
  3: {
    startMonth: 8,
    endMonth: 10,
    filters: [
      {
        type: 'seasonalGear',
        items: SEASONAL_SETS.fall,
      },
      {
        type: 'seasonalSpells',
        items: [
          'spookySparkles',
        ],
      },
      {
        type: 'seasonalQuests',
        items: [
        ],
      },
      {
        type: 'customizations',
        matcher: customizationMatcher([
          'hauntedHairColors',
          'supernaturalSkins',
        ]),
      },
    ],
  },
};

function getDay (date) {
  if (date === undefined) {
    return 0;
  }
  return date instanceof moment ? date.date() : date.getDate();
}

function getMonth (date) {
  if (date === undefined) {
    return 0;
  }
  return date instanceof moment ? date.month() : date.getMonth();
}

function getGalaIndex (date) {
  const month = date instanceof moment ? date.month() : date.getMonth();
  const todayDay = date instanceof moment ? date.date() : date.getDate();
  let galaMonth = month;
  const galaCount = Object.keys(GALA_SCHEDULE).length;
  if (todayDay >= GALA_SWITCHOVER_DAY) {
    galaMonth += 1;
  }
  if (galaMonth >= 12) {
    return 0;
  }
  return parseInt((galaCount / 12) * galaMonth, 10);
}

export function assembleScheduledMatchers (date) {
  const items = [];
  const month = date instanceof moment ? date.month() : date.getMonth();
  const todayDay = date instanceof moment ? date.date() : date.getDate();
  const previousMonth = month === 0 ? 11 : month - 1;
  for (const [day, value] of Object.entries(MONTHLY_SCHEDULE[previousMonth])) {
    if (day > todayDay) {
      items.push(...value);
    }
  }
  for (const [day, value] of Object.entries(MONTHLY_SCHEDULE[month])) {
    if (day <= todayDay) {
      items.push(...value);
    }
  }

  items.push(...GALA_SCHEDULE[getGalaIndex(date)].filters);
  for (const event in getRepeatingEvents(date)) {
    if (event.content) {
      items.push(...event.content);
    }
  }
  return items;
}

let cachedScheduleMatchers = null;
let cacheDate = null;

function makeMatcherClass () {
  return {
    matchers: [],
    items: [],
    match (key) {
      if (this.matchers.length === 0) {
        if (this.items.length > 0) {
          return inListMatcher(this.items)(key);
        }
      } else {
        if (this.items.length > 0 && !inListMatcher(this.items)(key)) {
          return false;
        }
        return this.matchers.every(m => m(key));
      }
      return false;
    },
    getEndDate () {
      return new Date();
    },
  };
}

export function getScheduleMatchingGroup (type, date) {
  const checkedDate = date || new Date();
  if (cacheDate !== null && (getDay(checkedDate) !== getDay(cacheDate)
    || getMonth(checkedDate) !== getMonth(cacheDate))) {
    cacheDate = null;
    cachedScheduleMatchers = null;
  }
  if (!cachedScheduleMatchers) {
    cacheDate = new Date();
    cachedScheduleMatchers = {};
    assembleScheduledMatchers(checkedDate).forEach(matcher => {
      if (!cachedScheduleMatchers[matcher.type]) {
        cachedScheduleMatchers[matcher.type] = makeMatcherClass();
      }
      if (matcher.matcher instanceof Function) {
        cachedScheduleMatchers[matcher.type].matchers.push(matcher.matcher);
      } else if (matcher.items instanceof Array) {
        cachedScheduleMatchers[matcher.type].items.push(...matcher.items);
      }
    });
  }
  if (!cachedScheduleMatchers[type]) {
    return {
      items: [],
      match () {
        return true;
      },
    };
  }
  return cachedScheduleMatchers[type];
}

export function getCurrentGalaKey (date) {
  return GALA_KEYS[getGalaIndex(date || new Date())];
}

export function getCurrentGalaEvent (date) {
  const checkedDate = date || new Date();
  const index = getGalaIndex(checkedDate);
  const key = GALA_KEYS[index];
  const gala = GALA_SCHEDULE[index];
  const today = new Date();
  return {
    event: key,
    npcImageSuffix: `_${key}`,
    season: key,
    start: `${today.getFullYear()}.${gala.startMonth + 1}.${GALA_SWITCHOVER_DAY}`,
    end: `${today.getFullYear()}.${gala.endMonth + 1}.${GALA_SWITCHOVER_DAY}`,
  };
}
