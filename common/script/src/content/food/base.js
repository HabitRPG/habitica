import {
  translator as t,
  setFoodDefaults
} from '../helpers';

const CAN_BUY = false;
const CAN_DROP = false;

let baseFood = {
  Meat: {
    target: 'Base',
    article: '',
  },
  Milk: {
    target: 'White',
    article: '',
  },
  Potatoe: {
    target: 'Desert',
    article: 'a ',
  },
  Strawberry: {
    target: 'Red',
    article: 'a ',
  },
  Chocolate: {
    target: 'Shade',
    article: '',
  },
  Fish: {
    target: 'Skeleton',
    article: 'a ',
  },
  RottenMeat: {
    target: 'Zombie',
    article: '',
  },
  CottonCandyPink: {
    target: 'CottonCandyPink',
    article: '',
  },
  CottonCandyBlue: {
    target: 'CottonCandyBlue',
    article: '',
  },
  Honey: {
    target: 'Golden',
    article: '',
  },
};

setFoodDefaults(baseFood, {canBuy: CAN_BUY, canDrop: CAN_DROP});

export default baseFood;
