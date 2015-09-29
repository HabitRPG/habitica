import headAccessory from '../../../common/script/src/content/gear/head-accessory';
import {each} from 'lodash';

describe('Head Accessory', () => {
  each(headAccessory, (set) => {
    each(set, (gear, key) => {
      describe(`${key} Head Accessory`, () => {
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
