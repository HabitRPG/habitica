import {
  expectValidTranslationString,
  describeEachItem
} from '../helpers/content.helper';
import {each} from 'lodash';

import allFood from '../../common/script/src/content/food';

describeEachItem('Food', allFood, (food, key) => {
  it('has a valid key', () => {
    expect(food.key).to.eql(key);
  });

  it('has a valid value attribute', () => {
    expect(food.value).to.be.greaterThan(0);
  });

  it('has a canBuy function', () => {
    expect(food.canBuy).to.be.a('function');
  });

  it('has a valid text attribute', () => {
    expectValidTranslationString(food.text);
  });

  it('has a valid notes attribute', () => {
    expectValidTranslationString(food.notes);
  });
});
