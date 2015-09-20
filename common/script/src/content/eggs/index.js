// value & other defaults set below
let each = require('lodash').each;
let defaults = require('lodash').defaults;
let t = require('../helpers/translator');

let dropEggs = require('./drops');

each(dropEggs, (egg, key) => {
  return defaults(egg, {
    canBuy: true,
    value: 3,
    key: key,
    notes: t('eggNotes', {
      eggText: egg.text,
      eggAdjective: egg.adjective
    }),
    mountText: egg.text
  });
});

export default {
  dropEggs: dropEggs
}
