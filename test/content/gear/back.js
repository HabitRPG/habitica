import back from '../../../common/script/src/content/gear/back';
import {each} from 'lodash';

describe('Back', () => {
  each(back, (set) => {
    each(set, (gear, key) => {
      describe(`${key} Back`, () => {
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
