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
  RoyalPurple: {},
  Cupid: {},
  Shimmer: {},
  Fairy: {},
  Floral: {},
  Aquatic: {},
  Ember: {},
  Thunderstorm: {},
  Spooky: {},
  Ghost: {},
  Holly: {},
  Peppermint: {},
  StarryNight: {},
  Rainbow: {},
  Glass: {},
  Glow: {},
  Frost: {},
  IcySnow: {},
  RoseQuartz: {},
  Celestial: {},
  Sunshine: {},
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
  Veggie: {},
  Dessert: {
    canBuy: hasQuestAchievementFunction('waffle'),
  },
  VirtualPet: {
    canBuy: hasQuestAchievementFunction('virtualpet'),
  },
  TeaShop: {},
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
