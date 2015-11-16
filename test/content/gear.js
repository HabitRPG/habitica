import {
  expectValidTranslationString,
} from '../helpers/content.helper';
import { each } from 'lodash';

import { tree as allGear } from '../../common/script/content/gear';

describe('Gear', () => {
  each(allGear, (piece, gearType) => {
    describe(gearType, () => {
      each(piece, (items, klass) => {
        context(`${klass} ${gearType}s`, () => {
          it('have a value of at least 0 for each stat', () => {
            each(items, (gear, itemKey) => {
              expect(gear.con).to.be.at.least(0);
              expect(gear.int).to.be.at.least(0);
              expect(gear.per).to.be.at.least(0);
              expect(gear.str).to.be.at.least(0);
            });
          });

          it('have a purchase value of at least 0', () => {
            each(items, (gear, itemKey) => {
              expect(gear.value).to.be.at.least(0);
            });
          });

          it('has a canBuy function', () => {
            each(items, (gear, itemKey) => {
              expect(gear.canBuy).to.be.a('function');
            });
          });

          it('have valid translation strings for text and notes', () => {
            each(items, (gear, itemKey) => {
              expectValidTranslationString(gear.text);
              expectValidTranslationString(gear.notes);
            });
          });
        });
      });
    });
  });
});
