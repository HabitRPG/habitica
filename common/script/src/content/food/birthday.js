import {each, defaults} from 'lodash';
import t from '../helpers/translator';

const CAN_BUY = false;
const CAN_DROP = false;

let cake = {
  Cake_Skeleton: {
    target: 'Skeleton',
    article: '',
  },
  Cake_Base: {
    target: 'Base',
    article: '',
  },
  Cake_CottonCandyBlue: {
    target: 'CottonCandyBlue',
    article: '',
  },
  Cake_CottonCandyPink: {
    target: 'CottonCandyPink',
    article: '',
  },
  Cake_Shade: {
    target: 'Shade',
    article: '',
  },
  Cake_White: {
    target: 'White',
    article: '',
  },
  Cake_Golden: {
    target: 'Golden',
    article: '',
  },
  Cake_Zombie: {
    target: 'Zombie',
    article: '',
  },
  Cake_Desert: {
    target: 'Desert',
    article: '',
  },
  Cake_Red: {
    target: 'Red',
    article: '',
  },
};

each(cake, (food, name) => {
  defaults(food, {
    canBuy: CAN_BUY,
    canDrop: CAN_DROP,
    text: t(`food${name}`),
  });
});

export default cake;
