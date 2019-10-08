import forOwn from 'lodash/forOwn';
import clone from 'lodash/clone';
import hair from './hair';
import shirts from './shirt.js';
import skins from './skin.js';
import sizes from './size.js';
import backgrounds from './backgrounds.js';
import chairs from './chair.js';

const reorderedBgs = {};

forOwn(backgrounds, (value, key) => {
  forOwn(value, (bgObject, bgKey) => {
    const bg = clone(bgObject);
    bg.set = {
      text: key,
      key,
      setPrice: 15,
    };
    reorderedBgs[bgKey] = bg;
  });
});


const appearances = {
  hair,
  shirt: shirts,
  size: sizes,
  skin: skins,
  chair: chairs,
  background: reorderedBgs,
};

export default appearances;
