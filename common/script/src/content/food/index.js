import {each, defaults, assign} from 'lodash';
import t from '../helpers/translator';

import baseFood from './base';
import saddle from './saddle';
import cake from './birthday';
import candy from './fall';

let allFood = {};

assign(allFood, baseFood);
assign(allFood, saddle);
assign(allFood, cake);
assign(allFood, candy);

each(allFood, (food, key) => {
  defaults(food, {
    value: 1,
    key: key,
    notes: t('foodNotes')
  });
});

export default allFood;
