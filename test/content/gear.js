import {
  expectValidTranslationString,
  describeEachItem
} from '../helpers/content.helper';
import {each} from 'lodash';

import {tree as allGear} from '../../common/script/src/content/gear';

describe('Gear', () => {
  each(allGear, (piece, type) => {
    describeEachItem(type, piece, (set, key) => {
      checkGearAttributes(set);
    });
  });
});

function checkGearAttributes(set) {
  each(set, (gear, key) => {
    describe(`${key}`, () => {

      it('has a value attribute', () => {
        expect(gear.value).to.be.at.least(0);
      });

      it('has a valid con attribute', () => {
        expect(gear.con).to.be.at.least(0);
      });

      it('has a valid int attribute', () => {
        expect(gear.int).to.be.at.least(0);
      });

      it('has a valid per attribute', () => {
        expect(gear.per).to.be.at.least(0);
      });

      it('has a valid str attribute', () => {
        expect(gear.str).to.be.at.least(0);
      });

      it('has a canBuy function', () => {
        expect(gear.canBuy).to.be.a('function');
      });

      it('has a valid text attribute', () => {
        expectValidTranslationString(gear.text);
      });

      it('has a valid notes attribute', () => {
        expectValidTranslationString(gear.notes);
      });
    });
  });
}
