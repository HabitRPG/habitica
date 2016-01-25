import hair from './hair';
import shirts from './shirt.js';
import skins from './skin.js';
import sizes from './size.js';
import backgrounds from './backgrounds.js';
import {forOwn, clone} from 'lodash';

let reorderedBgs = {};

forOwn(backgrounds, function restructureBackgroundSet (value, key) {
  forOwn(value, function restructureBackground (bgObject, bgKey) {
    let bg = clone(bgObject);
    bg.set = {
      text: key,
      key,
      setPrice: 15,
    };
    reorderedBgs[bgKey] = bg;
  });
});


let appearances = {
  hair,
  shirt: shirts,
  size: sizes,
  skin: skins,
  background: reorderedBgs,
};

module.exports = appearances;
