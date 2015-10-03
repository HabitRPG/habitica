import {tree as allGear} from '../../../common/script/src/content/gear';
import {each} from 'lodash';

describeEachItem('Armor', allGear.armor, (set, key) => {
  each(set, (gear, key) => {
    describe(`${key} Armor`, () => {

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

      it('has a canBy function', () => {
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
});
