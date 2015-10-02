import allFood from '../../common/script/src/content/food';
import {each} from 'lodash';

describe('Food Locales', () => {
  each(allFood, (food, key) => {
    describe(`${key} Food`, () => {
      it('has a valid text attribute', () => {
        expectValidTranslationString(food.text);
      });

      it('has a valid notes attribute', () => {
        expectValidTranslationString(food.notes);
      });
    });
  });
});
