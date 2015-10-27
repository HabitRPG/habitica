import {
  expectValidTranslationString,
  describeEachItem
} from '../helpers/content.helper';
import {each} from 'lodash';

import { all as potions } from '../../common/script/src/content/hatching-potions';

describeEachItem('Hatching Potions', potions, (potion, key) => {
  it('has a valid key', () => {
    expect(potion.key).to.eql(key);
  });

  it('has a canBuy function', () => {
    expect(potion.canBuy).to.be.a('function');
  });

  it('has a valid text attribute', () => {
    expectValidTranslationString(potion.text);
  });

  it('has a valid notes attribute', () => {
    expectValidTranslationString(potion.notes);
  });

  it('has a valid value', () => {
    expect(potion.value).to.be.greaterThan(0);
  });
});
