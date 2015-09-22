import {each, defaults, assign} from 'lodash';
import {translator as t} from '../helpers';

import baseFood from './base';
import saddle from './saddle';
import cake from './birthday';
import candy from './fall';

let allFood = {};

assign(allFood, baseFood);
assign(allFood, saddle);
assign(allFood, cake);
assign(allFood, candy);

export default allFood;
