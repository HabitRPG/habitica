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
  },
  White: {
    value: 2,
  },
  Desert: {
    value: 2,
  },
  Red: {
    value: 3,
  },
  Shade: {
    value: 3,
  },
  Skeleton: {
    value: 3,
  },
  Zombie: {
    value: 4,
  },
  CottonCandyPink: {
    value: 4,
  },
  CottonCandyBlue: {
    value: 4,
  },
  Golden: {
    value: 5,
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
    canBuy: hasQuestAchievementFunction('bronze'),
  },
  Watery: {},
  Silver: {
    canBuy: hasQuestAchievementFunction('silver'),
  },
  Shadow: {},
  Amber: {
    canBuy: hasQuestAchievementFunction('amber'),
  },
  Aurora: {},
  Ruby: {
    canBuy: hasQuestAchievementFunction('ruby'),
  },
  BirchBark: {},
  Fluorite: {
    canBuy: hasQuestAchievementFunction('fluorite'),
  },
  SandSculpture: {},
  Windup: {
    canBuy: hasQuestAchievementFunction('windup'),
  },
  Turquoise: {
    canBuy: hasQuestAchievementFunction('turquoise'),
  },
  Vampire: {},
  AutumnLeaf: {},
  BlackPearl: {
    canBuy: hasQuestAchievementFunction('blackPearl'),
  },
  StainedGlass: {},
  PolkaDot: {},
  MossyStone: {
    canBuy: hasQuestAchievementFunction('stone'),
  },
  Sunset: {},
  Moonglow: {},
  SolarSystem: {
    canBuy: hasQuestAchievementFunction('solarSystem'),
  },
  Onyx: {
    canBuy: hasQuestAchievementFunction('onyx'),
  },
  Porcelain: {},
  PinkMarble: {
    canBuy: hasQuestAchievementFunction('pinkMarble'),
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
    canBuy: hasQuestAchievementFunction('waffle'),
  },
  VirtualPet: {
    canBuy: hasQuestAchievementFunction('virtualpet'),
  },
  TeaShop: {
    text: t('hatchingPotionTeaShop'),
    limited: true,
    _addlNotes: t('premiumPotionAddlNotes', {
      date: t('dateEndApril'),
    }),
  },
  Fungi: {
    text: t('hatchingPotionFungi'),
    limited: true,
    _addlNotes: t('premiumPotionAddlNotes', {
      date: t('dateEndApril'),
    }),
    canBuy: hasQuestAchievementFunction('fungi'),
  },
};

each(drops, (pot, key) => {
  defaults(pot, {
    key,
    value: 2,
    text: t(`hatchingPotion${key}`),
    notes: t('hatchingPotionNotes', {
      potText: t(`hatchingPotion${key}`),
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
    text: t(`hatchingPotion${key}`),
    notes: t('hatchingPotionNotes', {
      potText: t(`hatchingPotion${key}`),
    }),
    _addlNotes: t('premiumPotionUnlimitedNotes'),
    premium: true,
    limited: true,
    canBuy () {
      return false;
    },
  });
});

each(wacky, (pot, key) => {
  defaults(pot, {
    key,
    value: 2,
    text: t(`hatchingPotion${key}`),
    notes: t('hatchingPotionNotes', {
      potText: t(`hatchingPotion${key}`),
    }),
    _addlNotes: t('premiumPotionUnlimitedNotes'),
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
