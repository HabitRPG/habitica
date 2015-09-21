import {each, defaults} from 'lodash';
import capitalize from 'lodash.capitalize';
import camelCase from 'lodash.camelcase';
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
  let camelName = camelCase(name);
  let capitalizedName = capitalize(camelName);

  defaults(food, {
    canBuy: CAN_BUY,
    canDrop: CAN_DROP,
    text: t(`food${capitalizedName}`),
  });
});

export default candy;
