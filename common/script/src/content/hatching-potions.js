import {setHatchingPotionDefaults} from './helpers';

let hatchingPotions = {
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
  }
};

setHatchingPotionDefaults(hatchingPotions);

export default hatchingPotions;
