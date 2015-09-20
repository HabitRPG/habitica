import {each, defaults} from 'lodash';
import t from '../helpers/translator';

const CAN_BUY = true;
const CAN_DROP = true;

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

each(baseFood, (food, name) => {
  defaults(food, {
    canBuy: CAN_BUY,
    canDrop: CAN_DROP,
    text: t(`food${name}`),
  });
});

export default baseFood;
