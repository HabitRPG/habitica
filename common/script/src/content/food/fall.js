import {
  translator as t,
  setFoodDefaults
} from '../helpers';

const CAN_BUY = true;
const CAN_DROP = true;

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

setFoodDefaults(candy, {canBuy: CAN_BUY, canDrop: CAN_DROP});

export default candy;
