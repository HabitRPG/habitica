import {
  merge,
  translator as t,
  setHatchingPotionDefaults
} from './helpers';

let dropPotions = {
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

let premiumPotions = {
  Spooky: {
    value: 2,
    addlNotes: t('premiumPotionAddlNotes'),
    premium: true,
    limited: true,
  },
};

setHatchingPotionDefaults(dropPotions);
setHatchingPotionDefaults(premiumPotions);

let allPotions = merge([dropPotions, premiumPotions]);

export default {
  all: allPotions,
  drop: dropPotions,
  premium: premiumPotions,
};
