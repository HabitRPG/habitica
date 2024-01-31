import moment from 'moment';
import SEASONAL_SETS from './seasonalSets';

function backgroundMatcher (month1, month2, oddYear) {
  return function call (key) {
    if (!key.startsWith('backgrounds')) return true;
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
        matcher: inListMatcher([
          'nudibranch',
          'seaserpent',
          'gryphon',
          'yarn',
          'axolotl',
        ]),
      },
      {
        type: 'hatchingPotionQuests',
        matcher: inListMatcher([
          'silver',
        ]),
      },
      {
        type: 'bundles',
        matcher: inListMatcher([
          'winterQuests',
        ]),
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        matcher: inListMatcher([
          'Aurora',
          'Moonglow',
          'IcySnow',
        ]),
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
        matcher: inListMatcher([
          'rooster',
          'slime',
          'peacock',
          'bunny',
        ]),
      },
      {
        type: 'hatchingPotionQuests',
        matcher: inListMatcher([
          'pinkMarble',
        ]),
      },
      {
        type: 'bundles',
        matcher: inListMatcher([
          'cuddleBuddies',
        ]),
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        matcher: inListMatcher([
          'PolkaDot',
          'Cupid',
          'RoseGold',
        ]),
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
        matcher: inListMatcher([
          'frog',
          'spider',
          'cow',
          'pterodactyl',
        ]),
      },
      {
        type: 'hatchingPotionQuests',
        matcher: inListMatcher([
        ]),
      },
      {
        type: 'bundles',
        matcher: inListMatcher([
          'birdBuddies',
        ]),
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        matcher: inListMatcher([
          'Birch',
          'StainedGlass',
          'Porcelain',
        ]),
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
        matcher: inListMatcher([
          'snake',
          'monkey',
          'falcon',
          'aligator',
        ]),
      },
      {
        type: 'hatchingPotionQuests',
        matcher: inListMatcher([
          'mossyStone',
        ]),
      },
      {
        type: 'bundles',
        matcher: inListMatcher([
          'hugabug',
        ]),
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        matcher: inListMatcher([
          'Shimmer',
          'Glass',
        ]),
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
        matcher: inListMatcher([
          'octopus',
          'horse',
          'kraken',
          'sloth',
        ]),
      },
      {
        type: 'hatchingPotionQuests',
        matcher: inListMatcher([
        ]),
      },
      {
        type: 'bundles',
        matcher: inListMatcher([
          'splashyPals',
        ]),
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        matcher: inListMatcher([
          'Floral',
          'Fairy',
          'RoseQuartz',
        ]),
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
        matcher: inListMatcher([
          'trex',
          'unicorn',
          'veolociraptor',
          'hippo',
        ]),
      },
      {
        type: 'hatchingPotionQuests',
        matcher: inListMatcher([
          'turquiose',
        ]),
      },
      {
        type: 'bundles',
        matcher: inListMatcher([
          'rockingReptiles',
        ]),
      },
      {
        type: 'bundles',
        matcher: inListMatcher([
          'delightfulDinos',
        ]),
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        matcher: inListMatcher([
          'Rainbow',
          'Sunshine',
        ]),
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
        matcher: inListMatcher([
          'whale',
          'seahorse',
          'armadillo',
          'guineapig',
        ]),
      },
      {
        type: 'hatchingPotionQuests',
        matcher: inListMatcher([
          'fluorite',
        ]),
      },
      {
        type: 'bundles',
        matcher: inListMatcher([
          'winterQuests',
        ]),
      },
      {
        type: 'bundles',
        matcher: inListMatcher([
          'aquaticAmigos',
        ]),
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        matcher: inListMatcher([
          'Celestial',
          'SandCastle',
          'Watery',
        ]),
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
        matcher: inListMatcher([
          'turtle',
          'penguin',
          'butterfly',
          'cheetah',
        ]),
      },
      {
        type: 'hatchingPotionQuests',
        matcher: inListMatcher([
          'blackPearl',
        ]),
      },
      {
        type: 'bundles',
        matcher: inListMatcher([
          'featheredFriends',
        ]),
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        matcher: inListMatcher([
          'Aquatic',
          'StarryNight',
          'Sunset',
        ]),
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
        matcher: inListMatcher([
          'squirrel',
          'triceratops',
          'treeling',
          'beetle',
        ]),
      },
      {
        type: 'hatchingPotionQuests',
        matcher: inListMatcher([
          'bronze',
        ]),
      },
      {
        type: 'bundles',
        matcher: inListMatcher([
          'farmFriends',
        ]),
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        matcher: inListMatcher([
          'Glow',
          'AutumnLeaf',
          'Shadow',
        ]),
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
        matcher: inListMatcher([
          'snail',
          'rock',
          'ferret',
          'hedgehog',
        ]),
      },
      {
        type: 'hatchingPotionQuests',
        matcher: inListMatcher([
          'onyx',
        ]),
      },
      {
        type: 'bundles',
        matcher: inListMatcher([
          'witchyFamiliars',
        ]),
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        matcher: inListMatcher([
          'Vampire',
          'Ghost',
          'Spooky',
        ]),
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
        matcher: inListMatcher([
          'sheep',
          'kangaroo',
          'owl',
          'rat',
          'badger',
        ]),
      },
      {
        type: 'hatchingPotionQuests',
        matcher: inListMatcher([
          'amber',
        ]),
      },
      {
        type: 'bundles',
        matcher: inListMatcher([
          'forestFriends',
        ]),
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        matcher: inListMatcher([
          'Ember',
          'Frost',
          'Thunderstorm',
        ]),
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
        matcher: inListMatcher([
          'ghost_stag',
          'trex_undead',
          'harpy',
          'sabretooth',
          'dolphin',
        ]),
      },
      {
        type: 'hatchingPotionQuests',
        matcher: inListMatcher([
          'ruby',
        ]),
      },
    ],
    [FOURTH_RELEASE_DAY]: [
      {
        type: 'premiumHatchingPotions',
        matcher: inListMatcher([
          'Peppermint',
          'Holly',
        ]),
      },
    ],
  },
};

export const GALA_SWITCHOVER_DAY = 21;
export const GALA_SCHEDULE = {
  0: [
    {
      type: 'seasonalGear',
      matcher: inListMatcher(SEASONAL_SETS.winter),
    },
  ],
  1: [
    {
      type: 'seasonalGear',
      matcher: inListMatcher(SEASONAL_SETS.spring),
    },
  ],
  2: [
    {
      type: 'seasonalGear',
      matcher: inListMatcher(SEASONAL_SETS.fall),
    },
  ],
  3: [
    {
      type: 'seasonalGear',
      matcher: inListMatcher(SEASONAL_SETS.summer),
    },
  ],
};

export function assembleScheduledMatchers (date) {
  console.log('Assembling new Schedule!');
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
  let galaMonth = month;
  const galaCount = Object.keys(GALA_SCHEDULE).length;
  if (todayDay >= GALA_SWITCHOVER_DAY) {
    galaMonth += 1;
  }
  items.push(...GALA_SCHEDULE[parseInt((galaCount / 12) * galaMonth, 10)]);
  return items;
}

let cachedScheduleMatchers = null;

export function getScheduleMatchingGroup (type, date) {
  if (!cachedScheduleMatchers) {
    cachedScheduleMatchers = {};
    assembleScheduledMatchers(date !== undefined ? date : new Date()).forEach(matcher => {
      if (cachedScheduleMatchers[matcher.type]) {
        cachedScheduleMatchers[matcher.type].matchers.push(matcher.matcher);
      } else {
        cachedScheduleMatchers[matcher.type] = {
          matchers: [matcher.matcher],
          match (key) {
            return this.matchers.every(m => m(key));
          },
        };
      }
    });
  }
  return cachedScheduleMatchers[type];
}
