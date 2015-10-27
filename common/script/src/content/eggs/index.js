import {merge} from '../helpers';

//--------------------------------------------------
// Eggs are generated from an array of pet keys
//
// <egg_key> : {
//  text: t(<type>Egg<egg_key>Text),
//  mountText: t(<type>Egg<egg_key>MountText),
//  notes: t(<type>Egg<egg_key>Text,{
//    eggText: this.text,
//    eggAdjective: t(<type>Egg<egg_key>Adjective)
//  }),
//  canBuy: <canBuy_boolean>,
//  value: 3,
//  key: <egg_key>,
// }
//
//  <egg_key> is the name of the pet associated with the egg
//  <type> is the type of egg (drop, quest, etc) passed in as part of an options object
//  <canBuy_boolean> is a boolean passed in as part of an options object
//--------------------------------------------------

import dropEggs from './drops';
import questEggs from './quest';

let allEggs = merge([dropEggs, questEggs]);

export default {
  allEggs: allEggs,
  dropEggs: dropEggs,
  questEggs: questEggs,
}
