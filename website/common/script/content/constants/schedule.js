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
export const GALA_SCHEDULE = {
  0: [
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
  ],
  1: [
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
  ],
  2: [
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
  ],
  3: [
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
  ],
};

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
      if (!cachedScheduleMatchers[matcher.type]) {
        cachedScheduleMatchers[matcher.type] = {
          matchers: [],
          items: [],
          match (key) {
            if (this.items.length > 0 && !inListMatcher(this.items)(key)) {
              return false;
            }
            return this.matchers.every(m => m(key));
          },
        };
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
