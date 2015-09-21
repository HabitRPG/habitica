import {assign} from 'lodash';

import dropEggs from './drops';
import questEggs from './quest';

let allEggs = {};

assign(allEggs, dropEggs);
assign(allEggs, questEggs);

export default {
  allEggs: allEggs,
  dropEggs: dropEggs,
  questEggs: questEggs,
}
