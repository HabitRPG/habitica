import {
  expectValidTranslationString,
  describeEachItem
} from '../helpers/content.helper';

import {allEggs} from '../../common/script/src/content/eggs';

describeEachItem('Eggs', allEggs, (egg, key) => {
  it('has a key attribute', () => {
    expect(egg.key).to.eql(key);
  });

  it('has a valid text attribute', () => {
    expectValidTranslationString(egg.text);
  });

  it('has a valid mountText attribute', () => {
    expectValidTranslationString(egg.mountText);
  });

  it('has a valid notes attribute', () => {
    expectValidTranslationString(egg.notes);
  });

  it('has a valid ajective attribute', () => {
    expectValidTranslationString(egg.adjective);
  });

  it('has a canBuy function', () => {
    expect(egg.canBuy).to.be.a('function');
  });

  it('has a value attribute', () => {
    expect(egg.value).to.be.greaterThan(0);
  });
});
