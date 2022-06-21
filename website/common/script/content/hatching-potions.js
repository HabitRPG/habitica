import assign from 'lodash/assign';
import defaults from 'lodash/defaults';
import each from 'lodash/each';
import moment from 'moment';
import t from './translation';
import { EVENTS } from './constants';

function hasQuestAchievementFunction (key) {
  return user => user.achievements.quests && user.achievements.quests[key] > 0;
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
      return moment().isBefore('2022-02-28T20:00-05:00');
    },
  },
  Shimmer: {
    value: 2,
    text: t('hatchingPotionShimmer'),
    limited: true,
    event: EVENTS.spring2022,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndMarch'),
      previousDate: t('marchYYYY', { year: 2020 }),
    }),
    canBuy () {
      return moment().isBefore(EVENTS.spring2022.end);
    },
  },
  Fairy: {
    value: 2,
    text: t('hatchingPotionFairy'),
    limited: true,
    event: EVENTS.potions202105,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndMay'),
      previousDate: t('mayYYYY', { year: 2020 }),
    }),
    canBuy () {
      return moment().isBefore(EVENTS.potions202105.end);
    },
  },
  Floral: {
    value: 2,
    text: t('hatchingPotionFloral'),
    limited: true,
    event: EVENTS.potions202205,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndMay'),
      previousDate: t('mayYYYY', { year: 2021 }),
    }),
    canBuy () {
      return moment().isBefore(EVENTS.potions202205.end);
    },
  },
  Aquatic: {
    value: 2,
    text: t('hatchingPotionAquatic'),
    limited: true,
    event: EVENTS.summer2022,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndJuly'),
      previousDate: t('augustYYYY', { year: 2020 }),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.summer2022.start, EVENTS.summer2022.end);
    },
  },
  Ember: {
    value: 2,
    text: t('hatchingPotionEmber'),
    limited: true,
    event: EVENTS.potions202111,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndNovember'),
      previousDate: t('novemberYYYY', { year: 2019 }),
    }),
    canBuy () {
      return moment().isBefore(EVENTS.potions202111.end);
    },
  },
  Thunderstorm: {
    value: 2,
    text: t('hatchingPotionThunderstorm'),
    limited: true,
    event: EVENTS.potions202108,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndAugust'),
      previousDate: t('novemberYYYY', { year: 2019 }),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.potions202108.start, EVENTS.potions202108.end);
    },
  },
  Spooky: {
    value: 2,
    text: t('hatchingPotionSpooky'),
    limited: true,
    event: EVENTS.fall2021,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndOctober'),
      previousDate: t('septemberYYYY', { year: 2019 }),
    }),
    canBuy () {
      return moment().isBefore(EVENTS.fall2021.end);
    },
  },
  Ghost: {
    value: 2,
    text: t('hatchingPotionGhost'),
    limited: true,
    event: EVENTS.fall2020,
    canBuy () {
      return moment().isBefore('2020-11-02');
    },
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndOctober'),
      previousDate: t('septemberYYYY', { year: 2018 }),
    }),
  },
  Holly: {
    value: 2,
    text: t('hatchingPotionHolly'),
    limited: true,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndJanuary'),
      previousDate: t('januaryYYYY', { year: 2020 }),
    }),
    event: EVENTS.winter2022,
    canBuy () {
      return moment().isBetween(EVENTS.winter2022.start, EVENTS.winter2022.end);
    },
  },
  Peppermint: {
    value: 2,
    text: t('hatchingPotionPeppermint'),
    limited: true,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndJanuary'),
      previousDate: t('januaryYYYY', { year: 2018 }),
    }),
    event: EVENTS.winter2022,
    canBuy () {
      return moment().isBetween(EVENTS.winter2022.start, EVENTS.winter2022.end);
    },
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
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndMarch'),
      previousDate: t('marchYYYY', { year: 2019 }),
    }),
    event: EVENTS.spring2021,
    canBuy () {
      return moment().isBefore(EVENTS.spring2021.end);
    },
  },
  Glass: {
    value: 2,
    text: t('hatchingPotionGlass'),
    limited: true,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndJuly'),
      previousDate: t('juneYYYY', { year: 2019 }),
    }),
    event: EVENTS.summer2021,
    canBuy () {
      return moment().isBetween(EVENTS.summer2021.start, EVENTS.summer2021.end);
    },
  },
  Glow: {
    value: 2,
    text: t('hatchingPotionGlow'),
    limited: true,
    event: EVENTS.fall2021,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndOctober'),
      previousDate: t('septemberYYYY', { year: 2019 }),
    }),
    canBuy () {
      return moment().isBefore(EVENTS.fall2021.end);
    },
  },
  Frost: {
    value: 2,
    text: t('hatchingPotionFrost'),
    limited: true,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndNovember'),
      previousDate: t('novemberYYYY', { year: 2018 }),
    }),
    canBuy () {
      return moment().isBefore('2020-12-02');
    },
  },
  IcySnow: {
    value: 2,
    text: t('hatchingPotionIcySnow'),
    limited: true,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndJanuary'),
      previousDate: t('decemberYYYY', { year: 2018 }),
    }),
    event: EVENTS.winter2021,
    canBuy () {
      return moment().isBetween('2020-12-22T08:00-04:00', '2021-01-31T20:00-04:00');
    },
  },
  RoseQuartz: {
    value: 2,
    text: t('hatchingPotionRoseQuartz'),
    limited: true,
    canBuy () {
      return moment().isBefore('2022-02-28T20:00-05:00');
    },
  },
  Celestial: {
    value: 2,
    text: t('hatchingPotionCelestial'),
    limited: true,
    event: EVENTS.spring2022,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndMarch'),
      previousDate: t('marchYYYY', { year: 2020 }),
    }),
    canBuy () {
      return moment().isBefore(EVENTS.spring2022.end);
    },
  },
  Sunshine: {
    value: 2,
    text: t('hatchingPotionSunshine'),
    limited: true,
    event: EVENTS.potions202205,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndMay'),
      previousDate: t('mayYYYY', { year: 2020 }),
    }),
    canBuy () {
      return moment().isBefore(EVENTS.potions202205.end);
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
    event: EVENTS.summer2022,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndJuly'),
      previousDate: t('julyYYYY', { year: 2020 }),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.summer2022.start, EVENTS.summer2022.end);
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
    event: EVENTS.fall2020,
    canBuy () {
      return moment().isBefore('2020-11-02');
    },
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndOctober'),
      previousDate: t('septemberYYYY', { year: 2019 }),
    }),
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
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndJanuary'),
      previousDate: t('decemberYYYY', { year: 2019 }),
    }),
    event: EVENTS.winter2021,
    canBuy () {
      return moment().isBetween('2020-12-22T08:00-04:00', '2021-01-31T20:00-04:00');
    },
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
    event: EVENTS.spring2021,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndMarch'),
      previousDate: t('marchYYYY', { year: 2020 }),
    }),
    canBuy () {
      return moment().isBefore(EVENTS.spring2021.end);
    },
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
    event: EVENTS.summer2021,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndJuly'),
      previousDate: t('juneYYYY', { year: 2020 }),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.summer2021.start, EVENTS.summer2021.end);
    },
  },
  Windup: {
    value: 2,
    text: t('hatchingPotionWindup'),
    limited: true,
    canBuy: hasQuestAchievementFunction('windup'),
    _addlNotes: t('premiumPotionUnlimitedNotes'),
  },
  Turquoise: {
    value: 2,
    text: t('hatchingPotionTurquoise'),
    limited: true,
    canBuy: hasQuestAchievementFunction('turquoise'),
    _addlNotes: t('premiumPotionUnlimitedNotes'),
  },
  Vampire: {
    value: 2,
    text: t('hatchingPotionVampire'),
    limited: true,
    event: EVENTS.fall2021,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndOctober'),
      previousDate: t('septemberYYYY', { year: 2020 }),
    }),
    canBuy () {
      return moment().isBefore(EVENTS.fall2021.end);
    },
  },
  AutumnLeaf: {
    value: 2,
    text: t('hatchingPotionAutumnLeaf'),
    limited: true,
    event: EVENTS.potions202111,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndNovember'),
      previousDate: t('novemberYYYY', { year: 2020 }),
    }),
    canBuy () {
      return moment().isBefore(EVENTS.potions202111.end);
    },
  },
  BlackPearl: {
    value: 2,
    text: t('hatchingPotionBlackPearl'),
    limited: true,
    canBuy: hasQuestAchievementFunction('blackPearl'),
    _addlNotes: t('premiumPotionUnlimitedNotes'),
  },
  StainedGlass: {
    value: 2,
    text: t('hatchingPotionStainedGlass'),
    limited: true,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndJanuary'),
      previousDate: t('januaryYYYY', { year: 2021 }),
    }),
    event: EVENTS.winter2022,
    canBuy () {
      return moment().isBetween(EVENTS.winter2022.start, EVENTS.winter2022.end);
    },
  },
  PolkaDot: {
    value: 2,
    text: t('hatchingPotionPolkaDot'),
    limited: true,
    event: EVENTS.spring2022,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndMarch'),
      previousDate: t('marchYYYY', { year: 2021 }),
    }),
    canBuy () {
      return moment().isBefore(EVENTS.spring2022.end);
    },
  },
  MossyStone: {
    value: 2,
    text: t('hatchingPotionMossyStone'),
    limited: true,
    canBuy: hasQuestAchievementFunction('stone'),
    _addlNotes: t('premiumPotionUnlimitedNotes'),
  },
  Sunset: {
    value: 2,
    text: t('hatchingPotionSunset'),
    limited: true,
    event: EVENTS.summer2022,
    _addlNotes: t('premiumPotionAddlNotes', {
      date: t('dateEndJuly'),
      previousDate: t('julyYYYY', { year: 2021 }),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.summer2022.start, EVENTS.summer2022.end);
    },
  },
  Moonglow: {
    value: 2,
    text: t('hatchingPotionMoonglow'),
    limited: true,
    event: EVENTS.potions202108,
    _addlNotes: t('premiumPotionAddlNotes', {
      date: t('dateEndAugust'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.potions202108.start, EVENTS.potions202108.end);
    },
  },
  SolarSystem: {
    value: 2,
    text: t('hatchingPotionSolarSystem'),
    limited: true,
    canBuy: hasQuestAchievementFunction('solarSystem'),
    _addlNotes: t('premiumPotionUnlimitedNotes'),
  },
  Onyx: {
    value: 2,
    text: t('hatchingPotionOnyx'),
    limited: true,
    canBuy: hasQuestAchievementFunction('onyx'),
    _addlNotes: t('premiumPotionUnlimitedNotes'),
  },
};

const wacky = {
  Veggie: {
    text: t('hatchingPotionVeggie'),
    limited: true,
    event: EVENTS.spring2022,
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndApril'),
      previousDate: t('aprilYYYY', { year: 2021 }),
    }),
    canBuy () {
      return moment().isBetween('2022-04-07T08:00-05:00', EVENTS.spring2022.end);
    },
  },
  Dessert: {
    text: t('hatchingPotionDessert'),
    limited: true,
    _addlNotes: t('premiumPotionUnlimitedNotes'),
    canBuy: hasQuestAchievementFunction('waffle'),
  },
  VirtualPet: {
    text: t('hatchingPotionVirtualPet'),
    limited: true,
    _addlNotes: t('premiumPotionUnlimitedNotes'),
    canBuy: hasQuestAchievementFunction('virtualpet'),
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
    _addlNotes:
      pot._season && pot._season !== '_PENDING_'
        ? t('eventAvailability', {
          date: t(`dateEnd${pot._season}`),
        })
        : null,
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
  drops, premium, wacky, all,
};
