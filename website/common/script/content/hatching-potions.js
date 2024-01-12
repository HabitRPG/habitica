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
    event: EVENTS.potions202402,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndFebruary'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.potions202402.start, EVENTS.potions202402.end);
    },
  },
  Shimmer: {
    value: 2,
    text: t('hatchingPotionShimmer'),
    limited: true,
    event: EVENTS.birthday10,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndJanuary'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.birthday10.start, EVENTS.birthday10.end);
    },
  },
  Fairy: {
    value: 2,
    text: t('hatchingPotionFairy'),
    limited: true,
    event: EVENTS.potions202305,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndMay'),
    }),
    canBuy () {
      return moment().isBefore(EVENTS.potions202305.end);
    },
  },
  Floral: {
    value: 2,
    text: t('hatchingPotionFloral'),
    limited: true,
    event: EVENTS.potions202305,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndMay'),
    }),
    canBuy () {
      return moment().isBefore(EVENTS.potions202305.end);
    },
  },
  Aquatic: {
    value: 2,
    text: t('hatchingPotionAquatic'),
    limited: true,
    event: EVENTS.birthday10,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndFebruary'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.birthday10.start, EVENTS.birthday10.end);
    },
  },
  Ember: {
    value: 2,
    text: t('hatchingPotionEmber'),
    limited: true,
    event: EVENTS.potions202311,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndNovember'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.potions202311.start, EVENTS.potions202311.end);
    },
  },
  Thunderstorm: {
    value: 2,
    text: t('hatchingPotionThunderstorm'),
    limited: true,
    event: EVENTS.potions202308,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndAugust'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.potions202308.start, EVENTS.potions202308.end);
    },
  },
  Spooky: {
    value: 2,
    text: t('hatchingPotionSpooky'),
    limited: true,
    event: EVENTS.fall2023,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndOctober'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.fall2023.start, EVENTS.fall2023.end);
    },
  },
  Ghost: {
    value: 2,
    text: t('hatchingPotionGhost'),
    limited: true,
    event: EVENTS.fall2022,
    canBuy () {
      return moment().isBetween(EVENTS.fall2022.start, EVENTS.fall2022.end);
    },
    _addlNotes: t('eventAvailability', {
      date: t('dateEndOctober'),
    }),
  },
  Holly: {
    value: 2,
    text: t('hatchingPotionHolly'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndJanuary'),
    }),
    event: EVENTS.winter2023,
    canBuy () {
      return moment().isBetween(EVENTS.winter2023.start, EVENTS.winter2023.end);
    },
  },
  Peppermint: {
    value: 2,
    text: t('hatchingPotionPeppermint'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndJanuary'),
    }),
    event: EVENTS.winter2024,
    canBuy () {
      return moment().isBetween(EVENTS.winter2024.start, EVENTS.winter2024.end);
    },
  },
  StarryNight: {
    value: 2,
    text: t('hatchingPotionStarryNight'),
    limited: true,
    event: EVENTS.winter2023,
    canBuy () {
      return moment().isBetween(EVENTS.winter2023.start, EVENTS.winter2023.end);
    },
    _addlNotes: t('eventAvailability', {
      date: t('dateEndJanuary'),
    }),
  },
  Rainbow: {
    value: 2,
    text: t('hatchingPotionRainbow'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndApril'),
    }),
    event: EVENTS.spring2023,
    canBuy () {
      return moment().isBefore(EVENTS.spring2023.end);
    },
  },
  Glass: {
    value: 2,
    text: t('hatchingPotionGlass'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndJuly'),
    }),
    event: EVENTS.summer2023,
    canBuy () {
      return moment().isBetween(EVENTS.summer2023.start, EVENTS.summer2023.end);
    },
  },
  Glow: {
    value: 2,
    text: t('hatchingPotionGlow'),
    limited: true,
    event: EVENTS.fall2023,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndOctober'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.fall2023.start, EVENTS.fall2023.end);
    },
  },
  Frost: {
    value: 2,
    text: t('hatchingPotionFrost'),
    limited: true,
    event: EVENTS.potions202311,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndNovember'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.potions202311.start, EVENTS.potions202311.end);
    },
  },
  IcySnow: {
    value: 2,
    text: t('hatchingPotionIcySnow'),
    limited: true,
    event: EVENTS.winter2024,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndJanuary'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.winter2024.start, EVENTS.winter2024.end);
    },
  },
  RoseQuartz: {
    value: 2,
    text: t('hatchingPotionRoseQuartz'),
    limited: true,
    event: EVENTS.potions202302,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndFebruary'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.potions202302.start, EVENTS.potions202302.end);
    },
  },
  Celestial: {
    value: 2,
    text: t('hatchingPotionCelestial'),
    limited: true,
    event: EVENTS.birthday10,
    _addlNotes: t('eventAvailability', {
      date: t('dateStartFebruary'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.birthday10.start, EVENTS.birthday10.end);
    },
  },
  Sunshine: {
    value: 2,
    text: t('hatchingPotionSunshine'),
    limited: true,
    event: EVENTS.potions202205,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndMay'),
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
    _addlNotes: t('eventAvailability', {
      date: t('dateEndJuly'),
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
    event: EVENTS.fall2022,
    canBuy () {
      return moment().isBetween(EVENTS.fall2022.start, EVENTS.fall2022.end);
    },
    _addlNotes: t('eventAvailability', {
      date: t('dateEndOctober'),
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
    _addlNotes: t('eventAvailability', {
      date: t('dateEndJanuary'),
    }),
    event: EVENTS.winter2023,
    canBuy () {
      return moment().isBetween(EVENTS.winter2023.start, EVENTS.winter2023.end);
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
    event: EVENTS.spring2023,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndApril'),
    }),
    canBuy () {
      return moment().isBefore(EVENTS.spring2023.end);
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
    event: EVENTS.summer2023,
    date: t('eventAvailability', {
      date: t('dateEndJuly'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.summer2023.start, EVENTS.summer2023.end);
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
    event: EVENTS.fall2023,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndOctober'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.fall2023.start, EVENTS.fall2023.end);
    },
  },
  AutumnLeaf: {
    value: 2,
    text: t('hatchingPotionAutumnLeaf'),
    limited: true,
    event: EVENTS.potions202311,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndNovember'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.potions202311.start, EVENTS.potions202311.end);
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
    _addlNotes: t('eventAvailability', {
      date: t('dateEndJanuary'),
    }),
    event: EVENTS.winter2024,
    canBuy () {
      return moment().isBetween(EVENTS.winter2024.start, EVENTS.winter2024.end);
    },
  },
  PolkaDot: {
    value: 2,
    text: t('hatchingPotionPolkaDot'),
    limited: true,
    event: EVENTS.spring2023,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndApril'),
    }),
    canBuy () {
      return moment().isBefore(EVENTS.spring2023.end);
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
    event: EVENTS.summer2023,
    _addlNotes: t('premiumPotionAddlNotes', {
      date: t('dateEndJuly'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.summer2023.start, EVENTS.summer2023.end);
    },
  },
  Moonglow: {
    value: 2,
    text: t('hatchingPotionMoonglow'),
    limited: true,
    event: EVENTS.potions202208,
    _addlNotes: t('premiumPotionAddlNotes', {
      date: t('dateEndAugust'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.potions202208.start, EVENTS.potions202208.end);
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
  Porcelain: {
    value: 2,
    text: t('hatchingPotionPorcelain'),
    limited: true,
    event: EVENTS.potions202308,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndAugust'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.potions202308.start, EVENTS.potions202308.end);
    },
  },
  PinkMarble: {
    value: 2,
    text: t('hatchingPotionPinkMarble'),
    limited: true,
    canBuy: hasQuestAchievementFunction('pinkMarble'),
    _addlNotes: t('premiumPotionUnlimitedNotes'),
  },
  RoseGold: {
    value: 2,
    text: t('hatchingPotionRoseGold'),
    limited: true,
    event: EVENTS.potions202402,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndFebruary'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.potions202402.start, EVENTS.potions202402.end);
    },
  },
};

const wacky = {
  Veggie: {
    text: t('hatchingPotionVeggie'),
    limited: true,
    event: EVENTS.spring2023,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndApril'),
    }),
    canBuy () {
      return moment().isBetween('2023-04-06T08:00-04:00', EVENTS.spring2023.end);
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
  TeaShop: {
    text: t('hatchingPotionTeaShop'),
    limited: true,
    event: EVENTS.spring2023,
    _addlNotes: t('premiumPotionAddlNotes', {
      date: t('dateEndApril'),
    }),
    canBuy () {
      return moment().isBetween('2023-04-06T08:00-04:00', EVENTS.spring2023.end);
    },
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
