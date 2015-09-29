import eyewear from '../../../common/script/src/content/gear/eyewear';
import {each} from 'lodash';

describe('Eyewear', () => {
  each(eyewear, (set) => {
    each(set, (gear, key) => {
      describe(`${key} Eyewear`, () => {
        it('has a valid text attribute', () => {
          expectValidTranslationString(gear.text);
        });

        it('has a valid notes attribute', () => {
          expectValidTranslationString(gear.notes);
        });
      });
    });
  });
});
