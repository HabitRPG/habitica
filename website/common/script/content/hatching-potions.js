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
    event: EVENTS.spring2024,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndApril'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.spring2024.start, EVENTS.spring2024.end);
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
    event: EVENTS.potions202405,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndMay'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.potions202405.start, EVENTS.potions202405.end);
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
    event: EVENTS.spring2024,
    canBuy () {
      return moment().isBetween(EVENTS.spring2024.start, EVENTS.spring2024.end);
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
    event: EVENTS.spring2024,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndApril'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.spring2024.start, EVENTS.spring2024.end);
    },
  },
  Sunshine: {
    value: 2,
    text: t('hatchingPotionSunshine'),
    limited: true,
    event: EVENTS.potions202405,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndMay'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.potions202405.start, EVENTS.potions202405.end);
    },
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
    event: EVENTS.aprilFoolsQuest2024,
    _addlNotes: t('eventAvailability', {
      date: t('dateEndApril'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.aprilFoolsQuest2024.start, EVENTS.aprilFoolsQuest2024.end);
    },
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
    event: EVENTS.aprilFoolsQuest2024,
    _addlNotes: t('premiumPotionAddlNotes', {
      date: t('dateEndApril'),
    }),
    canBuy () {
      return moment().isBetween(EVENTS.aprilFoolsQuest2024.start, EVENTS.aprilFoolsQuest2024.end);
    },
  },
  Fungi: {
    text: t('hatchingPotionFungi'),
    limited: true,
    event: EVENTS.aprilFoolsQuest2024,
    _addlNotes: t('premiumPotionAddlNotes', {
      date: t('dateEndApril'),
    }),
    canBuy: hasQuestAchievementFunction('fungi'),
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
