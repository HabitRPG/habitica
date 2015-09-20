import {each, defaults} from 'lodash';
import t from '../helpers/translator';

let allFood = {
  // Base
  Meat: {
    canBuy: true,
    canDrop: true,
    text: t('foodMeat'),
    target: 'Base',
    article: ''
  },
  Milk: {
    canBuy: true,
    canDrop: true,
    text: t('foodMilk'),
    target: 'White',
    article: ''
  },
  Potatoe: {
    canBuy: true,
    canDrop: true,
    text: t('foodPotatoe'),
    target: 'Desert',
    article: 'a '
  },
  Strawberry: {
    canBuy: true,
    canDrop: true,
    text: t('foodStrawberry'),
    target: 'Red',
    article: 'a '
  },
  Chocolate: {
    canBuy: true,
    canDrop: true,
    text: t('foodChocolate'),
    target: 'Shade',
    article: ''
  },
  Fish: {
    canBuy: true,
    canDrop: true,
    text: t('foodFish'),
    target: 'Skeleton',
    article: 'a '
  },
  RottenMeat: {
    canBuy: true,
    canDrop: true,
    text: t('foodRottenMeat'),
    target: 'Zombie',
    article: ''
  },
  CottonCandyPink: {
    canBuy: true,
    canDrop: true,
    text: t('foodCottonCandyPink'),
    target: 'CottonCandyPink',
    article: ''
  },
  CottonCandyBlue: {
    canBuy: true,
    canDrop: true,
    text: t('foodCottonCandyBlue'),
    target: 'CottonCandyBlue',
    article: ''
  },
  Honey: {
    canBuy: true,
    canDrop: true,
    text: t('foodHoney'),
    target: 'Golden',
    article: ''
  },

  Saddle: {
    canBuy: true,
    canDrop: false,
    text: t('foodSaddleText'),
    value: 5,
    notes: t('foodSaddleNotes')
  },

  // Cake
  Cake_Skeleton: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeSkeleton'),
    target: 'Skeleton',
    article: ''
  },
  Cake_Base: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeBase'),
    target: 'Base',
    article: ''
  },
  Cake_CottonCandyBlue: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeCottonCandyBlue'),
    target: 'CottonCandyBlue',
    article: ''
  },
  Cake_CottonCandyPink: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeCottonCandyPink'),
    target: 'CottonCandyPink',
    article: ''
  },
  Cake_Shade: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeShade'),
    target: 'Shade',
    article: ''
  },
  Cake_White: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeWhite'),
    target: 'White',
    article: ''
  },
  Cake_Golden: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeGolden'),
    target: 'Golden',
    article: ''
  },
  Cake_Zombie: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeZombie'),
    target: 'Zombie',
    article: ''
  },
  Cake_Desert: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeDesert'),
    target: 'Desert',
    article: ''
  },
  Cake_Red: {
    canBuy: false,
    canDrop: false,
    text: t('foodCakeRed'),
    target: 'Red',
    article: ''
  },

  // Fall
  Candy_Skeleton: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandySkeleton'),
    target: 'Skeleton',
    article: ''
  },
  Candy_Base: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyBase'),
    target: 'Base',
    article: ''
  },
  Candy_CottonCandyBlue: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyCottonCandyBlue'),
    target: 'CottonCandyBlue',
    article: ''
  },
  Candy_CottonCandyPink: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyCottonCandyPink'),
    target: 'CottonCandyPink',
    article: ''
  },
  Candy_Shade: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyShade'),
    target: 'Shade',
    article: ''
  },
  Candy_White: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyWhite'),
    target: 'White',
    article: ''
  },
  Candy_Golden: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyGolden'),
    target: 'Golden',
    article: ''
  },
  Candy_Zombie: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyZombie'),
    target: 'Zombie',
    article: ''
  },
  Candy_Desert: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyDesert'),
    target: 'Desert',
    article: ''
  },
  Candy_Red: {
    canBuy: false,
    canDrop: false,
    text: t('foodCandyRed'),
    target: 'Red',
    article: ''
  }
};

each(allFood, function(food, key) {
  defaults(food, {
    value: 1,
    key: key,
    notes: t('foodNotes')
  });
});

export default allFood;
