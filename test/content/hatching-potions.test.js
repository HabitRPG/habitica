import {
  each,
} from 'lodash';
import {
  expectValidTranslationString,
} from '../helpers/content.helper';

import hatchingPotions from '../../website/common/script/content/hatching-potions';

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

  it('does not contain unreleased potions', () => {
    clock = sinon.useFakeTimers(new Date('2024-05-20'));
    const premiumPotions = hatchingPotions.premium;
    expect(premiumPotions.Koi).to.not.exist;
  });

  it('Releases potions when appropriate without needing restarting', () => {
    clock = sinon.useFakeTimers(new Date('2024-05-20'));
    const mayPotions = hatchingPotions.premium;
    clock.restore();
    clock = sinon.useFakeTimers(new Date('2024-06-20'));
    const junePotions = hatchingPotions.premium;
    expect(junePotions.Koi).to.exist;
    expect(Object.keys(mayPotions).length).to.equal(Object.keys(junePotions).length - 1);
  });
});
