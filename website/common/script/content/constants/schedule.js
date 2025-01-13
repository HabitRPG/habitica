import moment from 'moment';
import nconf from 'nconf';
import SEASONAL_SETS from './seasonalSets';
import { getRepeatingEvents } from './events';

function isAfterNewSchedule (year, month) {
  if (year >= 2025) {
    return true;
  } if (year === 2024) {
    return month >= 6;
  }
  return false;
}

function backgroundMatcher (month1, month2, oddYear) {
  return function call (key, date) {
    const keyLength = key.length;
    const month = parseInt(key.substring(keyLength - 6, keyLength - 4), 10);
    const year = parseInt(key.substring(keyLength - 4, keyLength), 10);
    if (isAfterNewSchedule(year, month)) {
      if (date.getMonth() === 0 && month1 === 12) {
        return month === month1 && (date.getFullYear() - 1) >= year;
      }
      return month === month1 && date.getFullYear() >= year;
    }
    return (month === month1 || month === month2) && year % 2 === (oddYear ? 1 : 0);
  };
}

function timeTravelersMatcher (month1, month2) {
  return function call (item, date) {
    const month = parseInt(item.substring(4, 6), 10);
    const year = parseInt(item.substring(0, 4), 10);
    if (date.getFullYear() < year
      || (date.getFullYear() === year && (date.getMonth() + 1) === month)) {
      return false;
    }
    return month === month1 || month === month2;
  };
}

function inListMatcher (list) {
  return function call (item) {
    return list.indexOf(item) !== -1;
  };
}

export const ALWAYS_AVAILABLE_CUSTOMIZATIONS = [
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
  // January
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
          'Cupid',
          'IcySnow',
        ],
      },
    ],
  },
  // February
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
          'mythicalMarvels',
        ],
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        items: [
          'PolkaDot',
          'Celestial',
          'RoseGold',
        ],
      },
    ],
  },
  // March
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
          'StainedGlass',
          'Porcelain',
          'BirchBark',
        ],
      },
    ],
  },
  // April
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
          'alligator',
        ],
      },
      {
        type: 'hatchingPotionQuests',
        items: [
          'stone',
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
  // May
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
  // June
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
          'velociraptor',
          'hippo',
          'giraffe',
        ],
      },
      {
        type: 'hatchingPotionQuests',
        items: [
          'turquoise',
        ],
      },
      {
        type: 'bundles',
        items: [
          'delightfulDinos',
          'sandySidekicks',
        ],
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        items: [
          'Rainbow',
          'Sunshine',
          'Koi',
        ],
      },
    ],
  },
  // July
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
          'dilatory_derby',
          'armadillo',
          'guineapig',
          'chameleon',
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
          'aquaticAmigos',
          'jungleBuddies',
        ],
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        items: [
          'Moonglow',
          'Watery',
          'SandSculpture',
        ],
      },
    ],
  },
  // August
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
          'crab',
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
  // September
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
          'raccoon',
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
  // October
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
          'dog',
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
  // November
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
          'oddballs',
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
  // December
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
      {
        type: 'bundles',
        items: [
          'rockingReptiles',
        ],
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        items: [
          'Peppermint',
          'Holly',
          'Gingerbread',
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
  // Winter
  0: {
    startMonth: 11,
    endMonth: 2,
    matchers: [
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
  // Spring
  1: {
    startMonth: 2,
    endMonth: 5,
    matchers: [
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
  // Summer
  2: {
    startMonth: 5,
    endMonth: 8,
    matchers: [
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
          'summerHairColors',
          'splashySkins',
        ]),
      },
    ],
  },
  // Fall
  3: {
    startMonth: 8,
    endMonth: 11,
    matchers: [
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

const SWITCHOVER_TIME = nconf.get('CONTENT_SWITCHOVER_TIME_OFFSET') || process.env.CONTENT_SWITCHOVER_TIME_OFFSET || 0;

export const TYPE_SCHEDULE = {
  timeTravelers: FIRST_RELEASE_DAY,
  backgrounds: SECOND_RELEASE_DAY,
  petQuests: THIRD_RELEASE_DAY,
  hatchingPotionQuests: THIRD_RELEASE_DAY,
  bundles: THIRD_RELEASE_DAY,
  premiumHatchingPotions: FOURTH_RELEASE_DAY,
  seasonalGear: GALA_SWITCHOVER_DAY,
  seasonalSpells: GALA_SWITCHOVER_DAY,
  seasonalQuests: GALA_SWITCHOVER_DAY,
  customizations: GALA_SWITCHOVER_DAY,
};

function adjustDateForUTCAndSwitch (date) {
  const checkDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  checkDate.setHours(checkDate.getHours() - SWITCHOVER_TIME);
  return checkDate;
}

function getDay (date) {
  if (date === undefined) {
    return 0;
  }
  return adjustDateForUTCAndSwitch(date).getDate();
}

function getMonth (date) {
  if (date === undefined) {
    return 0;
  }
  return adjustDateForUTCAndSwitch(date).getMonth();
}

function getGalaIndex (date) {
  const month = getMonth(date);
  const todayDay = getDay(date);
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
  const month = getMonth(date);
  const todayDay = getDay(date);
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
  const gala = GALA_SCHEDULE[getGalaIndex(date)];
  const galaMatchers = gala.matchers;
  galaMatchers.forEach(matcher => {
    matcher.startMonth = gala.startMonth;
    matcher.endMonth = gala.endMonth;
  });
  items.push(...galaMatchers);
  getRepeatingEvents(date).forEach(event => {
    if (event.content) {
      items.push(...event.content);
    }
  });
  return items;
}

let cachedScheduleMatchers = null;
let cacheDate = null;

function makeMatcherClass (date) {
  return {
    matchers: [],
    end: new Date(),
    items: [],
    matchingDate: date,
    match (key) {
      if (this.matchers.length === 0) {
        if (this.items.length > 0) {
          return inListMatcher(this.items)(key, this.matchingDate);
        }
      } else {
        if (this.items.length > 0 && !inListMatcher(this.items)(key, this.matchingDate)) {
          return false;
        }
        return this.matchers.every(m => m(key, this.matchingDate));
      }
      return false;
    },
  };
}

function makeEndDate (checkedDate, matcher) {
  let end = moment.utc(checkedDate);
  end.date(TYPE_SCHEDULE[matcher.type]);
  end.hour(SWITCHOVER_TIME);
  end.minute(0);
  end.second(0);
  if (matcher.endMonth !== undefined) {
    if (matcher.startMonth
        && matcher.startMonth > matcher.endMonth
        && checkedDate.getMonth() > matcher.endMonth) {
      end.year(checkedDate.getFullYear() + 1);
    }
    end.month(matcher.endMonth);
  } else if (end.valueOf() <= checkedDate.getTime()) {
    end = moment(end).add(1, 'months');
  }
  return end.toDate();
}

export function clearCachedMatchers () {
  cacheDate = null;
  cachedScheduleMatchers = null;
}

export function getAllScheduleMatchingGroups (date) {
  const checkedDate = date || moment.utc().toDate();
  if (cacheDate !== null && (getDay(checkedDate) !== getDay(cacheDate)
    || getMonth(checkedDate) !== getMonth(cacheDate))) {
    // Clear cached matchers, since they are old
    clearCachedMatchers();
  }
  if (!cachedScheduleMatchers) {
    // No matchers exist, make new ones
    cacheDate = new Date();
    cachedScheduleMatchers = {};
    // subtract switchover time for the matcher classes, but
    // NOT to decide which matchers to assemble.
    // assembly uses getDate and getMonth which already adjust for switchover time
    const adjustedDate = adjustDateForUTCAndSwitch(checkedDate);
    assembleScheduledMatchers(checkedDate).forEach(matcher => {
      if (!cachedScheduleMatchers[matcher.type]) {
        cachedScheduleMatchers[matcher.type] = makeMatcherClass(adjustedDate);
      }
      cachedScheduleMatchers[matcher.type].end = makeEndDate(checkedDate, matcher);
      if (matcher.matcher instanceof Function) {
        cachedScheduleMatchers[matcher.type].matchers.push(matcher.matcher);
      } else if (matcher.items instanceof Array) {
        cachedScheduleMatchers[matcher.type].items.push(...matcher.items);
      }
    });
  }
  return cachedScheduleMatchers;
}

export function getScheduleMatchingGroup (type, date) {
  const matchingGroups = getAllScheduleMatchingGroups(date);
  if (!matchingGroups[type]) {
    // No matchers exist for this type
    return {
      items: [],
      match () {
        return true;
      },
    };
  }
  return matchingGroups[type];
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
    gear: true,
    start: `${today.getFullYear()}.${gala.startMonth + 1}.${GALA_SWITCHOVER_DAY}`,
    end: `${today.getFullYear()}.${gala.endMonth + 1}.${GALA_SWITCHOVER_DAY}`,
  };
}
