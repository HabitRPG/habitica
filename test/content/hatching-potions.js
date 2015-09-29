import hatchingPotions from '../../common/script/src/content/hatching-potions';
import {each} from 'lodash';

describe('Hatching Potion Locales', () => {
  each(hatchingPotions, (potion, key) => {
    describe(`${key} Potion`, () => {
      it('has a valid text attribute', () => {
        expectValidTranslationString(potion.text);
      });

      it('has a valid notes attribute', () => {
        expectValidTranslationString(potion.notes);
      });
    });
  });
});
