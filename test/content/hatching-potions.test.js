import {
  each,
} from 'lodash';
import {
  expectValidTranslationString,
} from '../helpers/content.helper';

import hatchingPotions from '../../website/common/script/content/hatching-potions';

describe('hatchingPotions', ()  => {
  describe('all', ()  => {
    it('is a combination of drop and premium potions', () => {
      let dropNumber = Object.keys(hatchingPotions.drops).length;
      let premiumNumber = Object.keys(hatchingPotions.premium).length;
      let allNumber = Object.keys(hatchingPotions.all).length;

      expect(allNumber).to.be.greaterThan(0);
      expect(allNumber).to.equal(dropNumber + premiumNumber);
    });

    it('contains basic information about each potion', () => {
      each(hatchingPotions.all, (potion, key) => {
        expectValidTranslationString(potion.text);
        expectValidTranslationString(potion.notes);
        expect(potion.canBuy).to.be.a('function');
        expect(potion.value).to.be.a('number');
        expect(potion.key).to.equal(key);
      });
    });
  });
});
