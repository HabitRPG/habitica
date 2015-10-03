import body from '../../../common/script/src/content/gear/body';
import {each} from 'lodash';

describe('Body', () => {
  each(body, (set) => {
    each(set, (gear, key) => {
      describe(`${key} Body`, () => {
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
