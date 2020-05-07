import forOwn from 'lodash/forOwn';
import clone from 'lodash/clone';
import hair from './hair';
import shirts from './shirt';
import skins from './skin';
import sizes from './size';
import backgrounds from './backgrounds';
import chairs from './chair';

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
  hair, NO appearances.hair.{bangs|base|beard|color|flower|mustache}[key].set.setPrice and .key
  shirt: shirts, appearances.shirt[key].set.setPrice and .key
  size: sizes, NO, does not have cost
  skin: skins, OK, appearances.skin[key].set.setPrice and .key
  chair: chairs, NO, does not have cost
  background: reorderedBgs, OK appearances.backgroud[key].set.setPrice and .key
};

^ check with get(path) after validating name because hair are nested for example
^ if item.set exist -> use item.setPrice
^ what about other items in set?

export default appearances;
