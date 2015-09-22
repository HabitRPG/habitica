import {each, defaults} from 'lodash';
import {
  translator as t,
  merge
} from '../helpers';

import baseFood from './base';
import saddle from './saddle';
import cake from './birthday';
import candy from './fall';

let allFood = merge([baseFood, saddle, cake, candy]);

export default allFood;
