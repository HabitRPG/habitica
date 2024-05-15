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
  },
  Shimmer: {
    value: 2,
    text: t('hatchingPotionShimmer'),
    limited: true,
  },
  Fairy: {
    value: 2,
    text: t('hatchingPotionFairy'),
    limited: true,
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
  },
  Ember: {
    value: 2,
    text: t('hatchingPotionEmber'),
    limited: true,
  },
  Thunderstorm: {
    value: 2,
    text: t('hatchingPotionThunderstorm'),
    limited: true,
  },
  Spooky: {
    value: 2,
    text: t('hatchingPotionSpooky'),
    limited: true,
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
  },
  Glow: {
    value: 2,
    text: t('hatchingPotionGlow'),
    limited: true,
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
  },
  Celestial: {
    value: 2,
    text: t('hatchingPotionCelestial'),
    limited: true,
  },
  Sunshine: {
    value: 2,
    text: t('hatchingPotionSunshine'),
    limited: true,
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
  Koi: {},
};

const wacky = {
  Veggie: {
    text: t('hatchingPotionVeggie'),
    limited: true,
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
  },
  Fungi: {
    text: t('hatchingPotionFungi'),
    limited: true,
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
