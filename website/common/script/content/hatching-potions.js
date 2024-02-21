import assign from 'lodash/assign';
import defaults from 'lodash/defaults';
import each from 'lodash/each';
import t from './translation';

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
    _addlNotes: t('eventAvailability', {
      date: t('dateEndFebruary'),
    }),
  },
  Shimmer: {
    value: 2,
    text: t('hatchingPotionShimmer'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndApril'),
    }),
  },
  Fairy: {
    value: 2,
    text: t('hatchingPotionFairy'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndMay'),
    }),
  },
  Floral: {
    value: 2,
    text: t('hatchingPotionFloral'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndMay'),
    }),
  },
  Aquatic: {
    value: 2,
    text: t('hatchingPotionAquatic'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndFebruary'),
    }),
  },
  Ember: {
    value: 2,
    text: t('hatchingPotionEmber'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndNovember'),
    }),
  },
  Thunderstorm: {
    value: 2,
    text: t('hatchingPotionThunderstorm'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndAugust'),
    }),
  },
  Spooky: {
    value: 2,
    text: t('hatchingPotionSpooky'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndOctober'),
    }),
  },
  Ghost: {
    value: 2,
    text: t('hatchingPotionGhost'),
    limited: true,
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
  },
  Peppermint: {
    value: 2,
    text: t('hatchingPotionPeppermint'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndJanuary'),
    }),
  },
  StarryNight: {
    value: 2,
    text: t('hatchingPotionStarryNight'),
    limited: true,
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
  },
  Glass: {
    value: 2,
    text: t('hatchingPotionGlass'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndJuly'),
    }),
  },
  Glow: {
    value: 2,
    text: t('hatchingPotionGlow'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndOctober'),
    }),
  },
  Frost: {
    value: 2,
    text: t('hatchingPotionFrost'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndNovember'),
    }),
  },
  IcySnow: {
    value: 2,
    text: t('hatchingPotionIcySnow'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndJanuary'),
    }),
  },
  RoseQuartz: {
    value: 2,
    text: t('hatchingPotionRoseQuartz'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndFebruary'),
    }),
  },
  Celestial: {
    value: 2,
    text: t('hatchingPotionCelestial'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndApril'),
    }),
  },
  Sunshine: {
    value: 2,
    text: t('hatchingPotionSunshine'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndMay'),
    }),
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
    _addlNotes: t('eventAvailability', {
      date: t('dateEndJuly'),
    }),
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
    _addlNotes: t('eventAvailability', {
      date: t('dateEndApril'),
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
    date: t('eventAvailability', {
      date: t('dateEndJuly'),
    }),
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
    _addlNotes: t('eventAvailability', {
      date: t('dateEndOctober'),
    }),
  },
  AutumnLeaf: {
    value: 2,
    text: t('hatchingPotionAutumnLeaf'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndNovember'),
    }),
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
  },
  PolkaDot: {
    value: 2,
    text: t('hatchingPotionPolkaDot'),
    limited: true,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndApril'),
    }),
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
    _addlNotes: t('premiumPotionAddlNotes', {
      date: t('dateEndJuly'),
    }),
  },
  Moonglow: {
    value: 2,
    text: t('hatchingPotionMoonglow'),
    limited: true,
    _addlNotes: t('premiumPotionAddlNotes', {
      date: t('dateEndAugust'),
    }),
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
    _addlNotes: t('eventAvailability', {
      date: t('dateEndAugust'),
    }),
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
    _addlNotes: t('eventAvailability', {
      date: t('dateEndApril'),
    }),
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
    _addlNotes: t('premiumPotionAddlNotes', {
      date: t('dateEndApril'),
    }),
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
