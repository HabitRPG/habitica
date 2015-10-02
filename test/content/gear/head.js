import head from '../../../common/script/src/content/gear/head';
import {each} from 'lodash';

describe('Head', () => {
  each(head, (set) => {
    each(set, (gear, key) => {
      describe(`${key} Head`, () => {
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
