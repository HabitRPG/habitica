import shield from '../../../common/script/src/content/gear/shield';
import {each} from 'lodash';

describe('Shield', () => {
  each(shield, (set) => {
    each(set, (gear, key) => {
      describe(`${key} Shield`, () => {
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
