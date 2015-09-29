import weapon from '../../../common/script/src/content/gear/weapon';
import {each} from 'lodash';

describe('Weapon', () => {
  each(weapon, (set) => {
    each(set, (gear, key) => {
      describe(`${key} Weapon`, () => {
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
