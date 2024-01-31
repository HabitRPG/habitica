import moment from 'moment';

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
    ],
    [FOURTH_RELEASE_DAY]: [
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
    ],
    [FOURTH_RELEASE_DAY]: [
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
    ],
    [FOURTH_RELEASE_DAY]: [
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
    ],
    [FOURTH_RELEASE_DAY]: [
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
    ],
    [FOURTH_RELEASE_DAY]: [
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
    ],
    [FOURTH_RELEASE_DAY]: [
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
    ],
    [FOURTH_RELEASE_DAY]: [
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
    ],
    [FOURTH_RELEASE_DAY]: [
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
    ],
    [FOURTH_RELEASE_DAY]: [
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
    ],
    [FOURTH_RELEASE_DAY]: [
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
    ],
    [FOURTH_RELEASE_DAY]: [
    ],
  },
};

export const GALA_SWITCHOVER_DAY = 21;
export const GALA_SCHEDULE = {
  0: [],
  1: [],
  2: [],
  3: [],
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
