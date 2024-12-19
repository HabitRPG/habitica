import defaults from 'lodash/defaults';
import each from 'lodash/each';
import { assign } from 'lodash';
import t from './translation';
import datedMemoize from '../fns/datedMemoize';
import { filterReleased } from './is_released';
import { HATCHING_POTIONS_RELEASE_DATES } from './constants/releaseDates';

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
    questPotion: true,
    canBuy: hasQuestAchievementFunction('bronze'),
  },
  Watery: {},
  Silver: {
    questPotion: true,
    canBuy: hasQuestAchievementFunction('silver'),
  },
  Shadow: {},
  Amber: {
    questPotion: true,
    canBuy: hasQuestAchievementFunction('amber'),
  },
  Aurora: {},
  Ruby: {
    questPotion: true,
    canBuy: hasQuestAchievementFunction('ruby'),
  },
  BirchBark: {},
  Fluorite: {
    questPotion: true,
    canBuy: hasQuestAchievementFunction('fluorite'),
  },
  SandSculpture: {},
  Windup: {
    questPotion: true,
    canBuy: hasQuestAchievementFunction('windup'),
  },
  Turquoise: {
    questPotion: true,
    canBuy: hasQuestAchievementFunction('turquoise'),
  },
  Vampire: {},
  AutumnLeaf: {},
  BlackPearl: {
    questPotion: true,
    canBuy: hasQuestAchievementFunction('blackPearl'),
  },
  StainedGlass: {},
  PolkaDot: {},
  MossyStone: {
    questPotion: true,
    canBuy: hasQuestAchievementFunction('stone'),
  },
  Sunset: {},
  Moonglow: {},
  SolarSystem: {
    questPotion: true,
    canBuy: hasQuestAchievementFunction('solarSystem'),
  },
  Onyx: {
    questPotion: true,
    canBuy: hasQuestAchievementFunction('onyx'),
  },
  Porcelain: {},
  PinkMarble: {
    questPotion: true,
    canBuy: hasQuestAchievementFunction('pinkMarble'),
  },
  RoseGold: {},
  Koi: {},
  Gingerbread: {},
};

const wacky = {
  Veggie: {},
  Dessert: {
    questPotion: true,
    canBuy: hasQuestAchievementFunction('waffle'),
  },
  VirtualPet: {
    questPotion: true,
    canBuy: hasQuestAchievementFunction('virtualpet'),
  },
  TeaShop: {},
  Fungi: {
    questPotion: true,
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

function filterEggs (eggs) {
  return filterReleased(eggs, 'key', HATCHING_POTIONS_RELEASE_DATES);
}

const memoizedFilter = datedMemoize(filterEggs);

export default {
  get drops () {
    return memoizedFilter({ memoizeConfig: true, identifier: 'drops' }, drops);
  },
  get premium () {
    return memoizedFilter({ memoizeConfig: true, identifier: 'premium' }, premium);
  },
  get wacky () {
    return memoizedFilter({ memoizeConfig: true, identifier: 'wacky' }, wacky);
  },
  get all () {
    return assign({}, this.drops, this.premium, this.wacky);
  },
};
