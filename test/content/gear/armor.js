import armor from '../../../common/script/src/content/gear/armor';
import {each} from 'lodash';

describe('Armor', () => {
  each(armor, (set) => {
    each(set, (gear, key) => {
      describe(`${key} Armor`, () => {
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
