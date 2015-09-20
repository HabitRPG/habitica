import {each, defaults} from 'lodash';
import t from '../helpers/translator';

const CAN_BUY = false;
const CAN_DROP = false;

let candy = {
  Candy_Skeleton: {
    target: 'Skeleton',
    article: '',
  },
  Candy_Base: {
    target: 'Base',
    article: '',
  },
  Candy_CottonCandyBlue: {
    target: 'CottonCandyBlue',
    article: '',
  },
  Candy_CottonCandyPink: {
    target: 'CottonCandyPink',
    article: '',
  },
  Candy_Shade: {
    target: 'Shade',
    article: '',
  },
  Candy_White: {
    target: 'White',
    article: '',
  },
  Candy_Golden: {
    target: 'Golden',
    article: '',
  },
  Candy_Zombie: {
    target: 'Zombie',
    article: '',
  },
  Candy_Desert: {
    target: 'Desert',
    article: '',
  },
  Candy_Red: {
    target: 'Red',
    article: '',
  }
};

each(candy, (food, name) => {
  defaults(food, {
    canBuy: CAN_BUY,
    canDrop: CAN_DROP,
    text: t(`food${name}`),
  });
});

export default candy;
