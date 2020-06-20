import assign from 'lodash/assign';
import defaults from 'lodash/defaults';
import each from 'lodash/each';
import moment from 'moment';
import t from './translation';
import {
  EVENTS,
} from './constants';

function hasQuestAchievementFunction (key) {
  return user => user.achievements.quests
      && user.achievements.quests[key] > 0;
}

const drops = {
  Base: {
    value: 2,
    text: t('hatchingPotionBase'),
  },
  White: {
    value: 2,
    text: t('hatchingPotionWhite'),
  },
  Desert: {
    value: 2,
    text: t('hatchingPotionDesert'),
  },
  Red: {
    value: 3,
    text: t('hatchingPotionRed'),
  },
  Shade: {
    value: 3,
    text: t('hatchingPotionShade'),
  },
  Skeleton: {
    value: 3,
    text: t('hatchingPotionSkeleton'),
  },
  Zombie: {
    value: 4,
    text: t('hatchingPotionZombie'),
  },
  CottonCandyPink: {
    value: 4,
    text: t('hatchingPotionCottonCandyPink'),
  },
  CottonCandyBlue: {
    value: 4,
    text: t('hatchingPotionCottonCandyBlue'),
  },
  Golden: {
    value: 5,
    text: t('hatchingPotionGolden'),
  },
};

const premium = {
  RoyalPurple: {
    value: 2,
    text: t('hatchingPotionRoyalPurple'),
    limited: true,
  },
  Cupid: {
    value: 2,
    text: t('hatchingPotionCupid'),
    limited: true,
    canBuy () {
      return moment().isBefore('2020-03-02');
    },
  },
  Shimmer: {
    value: 2,
    text: t('hatchingPotionShimmer'),
    limited: true,
    event: EVENTS.spring2020,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndMarch'),
      previousDate: t('marchYYYY', { year: 2018 }),
    }),
    canBuy () {
      return moment().isBefore('2020-05-02');
    },
  },
  Fairy: {
    value: 2,
    text: t('hatchingPotionFairy'),
    limited: true,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndMay'),
      previousDate: t('mayYYYY', { year: 2017 }),
    }),
    canBuy () {
      return moment().isBefore('2020-06-02');
    },
  },
  Floral: {
    value: 2,
    text: t('hatchingPotionFloral'),
    limited: true,
  },
  Aquatic: {
    value: 2,
    text: t('hatchingPotionAquatic'),
    limited: true,
    event: EVENTS.summer2020,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndJuly'),
      previousDate: t('juneYYYY', { year: 2017 }),
    }),
    canBuy () {
      return moment().isBefore('2020-08-02');
    },
  },
  Ember: {
    value: 2,
    text: t('hatchingPotionEmber'),
    limited: true,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndNovember'),
      previousDate: t('augustYYYY', { year: 2017 }),
    }),
    canBuy () {
      return moment().isBetween('2019-11-12', '2019-12-02');
    },
  },
  Thunderstorm: {
    value: 2,
    text: t('hatchingPotionThunderstorm'),
    limited: true,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndNovember'),
      previousDate: t('augustYYYY', { year: 2016 }),
    }),
    canBuy () {
      return moment().isBetween('2019-11-12', '2019-12-02');
    },
  },
  Spooky: {
    value: 2,
    text: t('hatchingPotionSpooky'),
    limited: true,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndOctober'),
      previousDate: t('september2017'),
    }),
  },
  Ghost: {
    value: 2,
    text: t('hatchingPotionGhost'),
    limited: true,
  },
  Holly: {
    value: 2,
    text: t('hatchingPotionHolly'),
    limited: true,
    canBuy () {
      return moment().isBetween('2019-12-19', '2020-02-02');
    },
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndJanuary'),
      previousDate: t('decemberYYYY', { year: 2016 }),
    }),
  },
  Peppermint: {
    value: 2,
    text: t('hatchingPotionPeppermint'),
    limited: true,
  },
  StarryNight: {
    value: 2,
    text: t('hatchingPotionStarryNight'),
    limited: true,
    canBuy () {
      return moment().isBetween('2019-12-19', '2020-02-02');
    },
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndJanuary'),
      previousDate: t('decemberYYYY', { year: 2017 }),
    }),
  },
  Rainbow: {
    value: 2,
    text: t('hatchingPotionRainbow'),
    limited: true,
  },
  Glass: {
    value: 2,
    text: t('hatchingPotionGlass'),
    limited: true,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndJuly'),
      previousDate: t('june2018'),
    }),
  },
  Glow: {
    value: 2,
    text: t('hatchingPotionGlow'),
    limited: true,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndOctober'),
      previousDate: t('september2018'),
    }),
  },
  Frost: {
    value: 2,
    text: t('hatchingPotionFrost'),
    limited: true,
  },
  IcySnow: {
    value: 2,
    text: t('hatchingPotionIcySnow'),
    limited: true,
  },
  RoseQuartz: {
    value: 2,
    text: t('hatchingPotionRoseQuartz'),
    limited: true,
    canBuy () {
      return moment().isBefore('2020-03-02');
    },
  },
  Celestial: {
    value: 2,
    text: t('hatchingPotionCelestial'),
    limited: true,
    event: EVENTS.spring2020,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndMarch'),
      previousDate: t('marchYYYY', { year: 2019 }),
    }),
    canBuy () {
      return moment().isBefore('2020-05-02');
    },
  },
  Sunshine: {
    value: 2,
    text: t('hatchingPotionSunshine'),
    limited: true,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndMay'),
      previousDate: t('mayYYYY', { year: 2019 }),
    }),
    canBuy () {
      return moment().isBefore('2020-06-02');
    },
  },
  Bronze: {
    value: 2,
    text: t('hatchingPotionBronze'),
    limited: true,
    canBuy: hasQuestAchievementFunction('bronze'),
    _addlNotes: t('premiumPotionUnlimitedNotes'),
  },
  Watery: {
    value: 2,
    text: t('hatchingPotionWatery'),
    limited: true,
    event: EVENTS.summer2020,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndJuly'),
      previousDate: t('juneYYYY', { year: 2019 }),
    }),
    canBuy () {
      return moment().isBefore('2020-08-02');
    },
  },
  Silver: {
    value: 2,
    text: t('hatchingPotionSilver'),
    limited: true,
    canBuy: hasQuestAchievementFunction('silver'),
    _addlNotes: t('premiumPotionUnlimitedNotes'),
  },
  Shadow: {
    value: 2,
    text: t('hatchingPotionShadow'),
    limited: true,
  },
  Amber: {
    value: 2,
    text: t('hatchingPotionAmber'),
    limited: true,
    canBuy: hasQuestAchievementFunction('amber'),
    _addlNotes: t('premiumPotionUnlimitedNotes'),
  },
  Aurora: {
    value: 2,
    text: t('hatchingPotionAurora'),
    limited: true,
    canBuy () {
      return moment().isBetween('2019-12-19', '2020-02-02');
    },
    _addlNotes: t('premiumPotionAddlNotes', {
      date: t('dateEndJanuary'),
    }),
  },
  Ruby: {
    value: 2,
    text: t('hatchingPotionRuby'),
    limited: true,
    canBuy: hasQuestAchievementFunction('ruby'),
    _addlNotes: t('premiumPotionUnlimitedNotes'),
  },
  BirchBark: {
    value: 2,
    text: t('hatchingPotionBirchBark'),
    limited: true,
    event: EVENTS.spring2020,
    canBuy () {
      return moment().isBefore('2020-05-02');
    },
    _addlNotes: t('premiumPotionAddlNotes', {
      date: t('dateEndMarch'),
    }),
  },
  Fluorite: {
    value: 2,
    text: t('hatchingPotionFluorite'),
    limited: true,
    canBuy: hasQuestAchievementFunction('fluorite'),
    _addlNotes: t('premiumPotionUnlimitedNotes'),
  },
  SandSculpture: {
    value: 2,
    text: t('hatchingPotionSandSculpture'),
    limited: true,
    event: EVENTS.summer2020,
    canBuy () {
      return moment().isBefore('2020-08-02');
    },
    _addlNotes: t('premiumPotionAddlNotes', {
      date: t('dateEndJuly'),
    }),
  },
};

const wacky = {
  Veggie: {
    text: t('hatchingPotionVeggie'),
    limited: true,
    event: EVENTS.spring2020,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndMarch'),
      previousDate: t('marchYYYY', { year: 2019 }),
    }),
    canBuy () {
      return moment().isBefore('2020-05-02');
    },
  },
  Dessert: {
    text: t('hatchingPotionDessert'),
    limited: true,
    _addlNotes: t('premiumPotionUnlimitedNotes'),
    canBuy: hasQuestAchievementFunction('waffle'),
  },
};

each(drops, (pot, key) => {
  defaults(pot, {
    key,
    value: 2,
    notes: t('hatchingPotionNotes', {
      potText: pot.text,
    }),
    premium: false,
    limited: false,
    canBuy () {
      return true;
    },
  });
});

each(premium, (pot, key) => {
  defaults(pot, {
    key,
    value: 2,
    notes: t('hatchingPotionNotes', {
      potText: pot.text,
    }),
    _addlNotes: t('eventAvailability', {
      date: t('dateEndFebruary'),
    }),
    premium: true,
    limited: false,
    canBuy () {
      return false;
    },
  });
});

each(wacky, (pot, key) => {
  defaults(pot, {
    key,
    value: 2,
    notes: t('hatchingPotionNotes', {
      potText: pot.text,
    }),
    _addlNotes: pot._season && pot._season !== '_PENDING_' ? t('eventAvailability', {
      date: t(`dateEnd${pot._season}`),
    }) : null,
    premium: false,
    limited: true,
    wacky: true,
    canBuy () {
      return false;
    },
  });
});

const all = assign({}, drops, premium, wacky);

export {
  drops,
  premium,
  wacky,
  all,
};
