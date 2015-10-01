import {each, defaults} from 'lodash';
import {
  translator as t,
  merge
} from '../helpers';

//--------------------------------------------------
// Food are series objects that have defaults applied if not provided
//
// <food_key> : {
//  key: <food_key>,
//  text: t(food<formatted_key>),
//  notes: t(foodNotes),
//  article: <article>,
//  target: <target_key>,
//  value: <value>,
//  canBuy: <canBuy_boolean>,
//  canDrop: <canDrop_boolean>,
// }
//
//  <food_key> is the name of the food
//  <formatted_key> is a screeaming camelCase version of the key
//  <article> is whether the food requires an indefinite article ('a', 'an', '')
//  <target_key> is the potion key that this food targets
//  <value> is the price of the food - defaults to 1
//  <canBuy_boolean> is a boolean passed in as part of an options object
//  <canDrop_boolean> is a boolean passed in as part of an options object
//--------------------------------------------------

import baseFood from './base';
import saddle from './saddle';
import cake from './birthday';
import candy from './fall';

let allFood = merge([baseFood, saddle, cake, candy]);

export default allFood;
