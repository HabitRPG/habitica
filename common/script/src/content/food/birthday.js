import {
  translator as t,
  setFoodDefaults
} from '../helpers';

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

setFoodDefaults(cake, {canBuy: CAN_BUY, canDrop: CAN_DROP});

export default cake;
