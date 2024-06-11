import {
  each,
} from 'lodash';
import {
  expectValidTranslationString,
} from '../helpers/content.helper';

import * as eggs from '../../website/common/script/content/eggs';

describe('eggs', () => {
  describe('all', () => {
    it('is a combination of drop and quest eggs', () => {
      const dropNumber = Object.keys(eggs.drops).length;
      const questNumber = Object.keys(eggs.quests).length;
      const allNumber = Object.keys(eggs.all).length;

      expect(allNumber).to.be.greaterThan(0);
      expect(allNumber).to.equal(dropNumber + questNumber);
    });

    it('contains basic information about each egg', () => {
      each(eggs.all, (egg, key) => {
        expectValidTranslationString(egg.text);
        expectValidTranslationString(egg.adjective);
        expectValidTranslationString(egg.mountText);
        expectValidTranslationString(egg.notes);
        expect(egg.canBuy).to.be.a('function');
        expect(egg.value).to.be.a('number');
        expect(egg.key).to.equal(key);
      });
    });
  });
});
