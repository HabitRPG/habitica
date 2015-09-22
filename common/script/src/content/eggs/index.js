import {merge} from '../helpers';

import dropEggs from './drops';
import questEggs from './quest';

let allEggs = merge([dropEggs, questEggs]);

export default {
  allEggs: allEggs,
  dropEggs: dropEggs,
  questEggs: questEggs,
}
