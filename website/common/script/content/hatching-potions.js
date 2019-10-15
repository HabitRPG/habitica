import assign from 'lodash/assign';
import defaults from 'lodash/defaults';
import each from 'lodash/each';
import t from './translation';

const CURRENT_SEASON = 'October';

function hasQuestAchievementFunction (key) {
  return (user) => {
    return user.achievements.quests &&
      user.achievements.quests[key] > 0;
  };
}

let drops = {
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

let premium = {
  RoyalPurple: {
    value: 2,
    text: t('hatchingPotionRoyalPurple'),
    limited: true,
  },
  Cupid: {
    value: 2,
    text: t('hatchingPotionCupid'),
    limited: true,
    _season: '_PENDING_',
  },
  Shimmer: {
    value: 2,
    text: t('hatchingPotionShimmer'),
    limited: true,
    _season: '_PENDING_',
  },
  Fairy: {
    value: 2,
    text: t('hatchingPotionFairy'),
    limited: true,
    _season: '_PENDING_',
  },
  Floral: {
    value: 2,
    text: t('hatchingPotionFloral'),
    limited: true,
    _season: '_PENDING_',
  },
  Aquatic: {
    value: 2,
    text: t('hatchingPotionAquatic'),
    limited: true,
    _season: '_PENDING_',
  },
  Ember: {
    value: 2,
    text: t('hatchingPotionEmber'),
    limited: true,
    _season: '_PENDING_',
  },
  Thunderstorm: {
    value: 2,
    text: t('hatchingPotionThunderstorm'),
    limited: true,
    _season: '_PENDING_',
  },
  Spooky: {
    value: 2,
    text: t('hatchingPotionSpooky'),
    limited: true,
    _season: 'October',
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndOctober'),
      previousDate: t('september2017'),
    }),
  },
  Ghost: {
    value: 2,
    text: t('hatchingPotionGhost'),
    limited: true,
    _season: '_PENDING_',
  },
  Holly: {
    value: 2,
    text: t('hatchingPotionHolly'),
    limited: true,
    _season: '_PENDING_',
  },
  Peppermint: {
    value: 2,
    text: t('hatchingPotionPeppermint'),
    limited: true,
    _season: '_PENDING_',
  },
  StarryNight: {
    value: 2,
    text: t('hatchingPotionStarryNight'),
    limited: true,
    _season: '_PENDING_',
  },
  Rainbow: {
    value: 2,
    text: t('hatchingPotionRainbow'),
    limited: true,
    _season: '_PENDING_',
  },
  Glass: {
    value: 2,
    text: t('hatchingPotionGlass'),
    limited: true,
    _season: '_PENDING_',
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndJuly'),
      previousDate: t('june2018'),
    }),
  },
  Glow: {
    value: 2,
    text: t('hatchingPotionGlow'),
    limited: true,
    _season: 'October',
    _addlNotes: t('eventAvailabilityReturning', {
      availableDate: t('dateEndOctober'),
      previousDate: t('september2018'),
    }),
  },
  Frost: {
    value: 2,
    text: t('hatchingPotionFrost'),
    limited: true,
    _season: '_PENDING_',
  },
  IcySnow: {
    value: 2,
    text: t('hatchingPotionIcySnow'),
    limited: true,
    _season: '_PENDING_',
  },
  RoseQuartz: {
    value: 2,
    text: t('hatchingPotionRoseQuartz'),
    limited: true,
    _season: '_PENDING_',
  },
  Celestial: {
    value: 2,
    text: t('hatchingPotionCelestial'),
    limited: true,
    _season: '_PENDING_',
  },
  Sunshine: {
    value: 2,
    text: t('hatchingPotionSunshine'),
    limited: true,
    _season: '_PENDING_',
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
    _season: '_PENDING_',
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
    _season: 'October',
  },
};

const wacky = {
  Veggie: {
    text: t('hatchingPotionVeggie'),
    limited: true,
    _season: '_PENDING_',
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
    _addlNotes: t('premiumPotionAddlNotes', {
      date: t(`dateEnd${pot._season}`),
    }),
    premium: true,
    limited: false,
    canBuy () {
      return pot._season === CURRENT_SEASON;
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
    _addlNotes: t('eventAvailability', {
      date: t(`dateEnd${pot._season}`),
    }),
    premium: false,
    limited: true,
    wacky: true,
    canBuy () {
      return pot._season === CURRENT_SEASON;
    },
  });
});

let all = assign({}, drops, premium, wacky);

module.exports = {
  drops,
  premium,
  wacky,
  all,
};
