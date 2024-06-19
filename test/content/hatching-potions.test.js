import {
  each,
} from 'lodash';
import {
  expectValidTranslationString,
} from '../helpers/content.helper';

import { all } from '../../website/common/script/content/hatching-potions';

describe('hatchingPotions', () => {
  let clock;

  afterEach(() => {
    if (clock) {
      clock.restore();
    }
  });

  const potionTypes = [
    'drops',
    'quests',
    'premium',
    'wacky',
  ];
  potionTypes.forEach(potionType => {
    describe(potionType, () => {
      it('contains basic information about each potion', () => {
        each(all, (potion, key) => {
          expectValidTranslationString(potion.text);
          expectValidTranslationString(potion.notes);
          expect(potion.canBuy).to.be.a('function');
          expect(potion.value).to.be.a('number');
          expect(potion.key).to.equal(key);
        });
      });
    });
  });
});
