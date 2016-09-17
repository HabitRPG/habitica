import {
  expectValidTranslationString,
} from '../helpers/content.helper';
import { each, camelCase } from 'lodash';

import { tree as allGear } from '../../website/common/script/content/gear';
import backerGear from '../../website/common/script/content/gear/sets/special/special-backer';
import contributorGear from '../../website/common/script/content/gear/sets/special/special-contributor';

describe('Gear', () => {
  each(allGear, (piece, gearType) => {
    describe(gearType, () => {
      each(piece, (items, klass) => {
        context(`${klass} ${gearType}s`, () => {
          it('have a value of at least 0 for each stat', () => {
            each(items, (gear) => {
              expect(gear.con).to.be.at.least(0);
              expect(gear.int).to.be.at.least(0);
              expect(gear.per).to.be.at.least(0);
              expect(gear.str).to.be.at.least(0);
            });
          });

          it('have a purchase value of at least 0', () => {
            each(items, (gear) => {
              expect(gear.value).to.be.at.least(0);
            });
          });

          it('has a canBuy function', () => {
            each(items, (gear) => {
              expect(gear.canBuy).to.be.a('function');
            });
          });

          it('have valid translation strings for text and notes', () => {
            each(items, (gear) => {
              expectValidTranslationString(gear.text);
              expectValidTranslationString(gear.notes);
            });
          });

          it('has a set attribue', () => {
            each(items, (gear) => {
              expect(gear.set).to.exist;
            });
          });
        });
      });
    });
  });

  describe('backer gear', () => {
    let user;

    beforeEach(() => {
      user = {
        backer: {},
        items: { gear: { owned: {} } },
      };
    });

    let cases = {
      armor_special_0: 45,
      armor_special_2: 300,
      head_special_0: 45,
      head_special_2: 300,
      weapon_special_0: 70,
      weapon_special_2: 300,
      weapon_special_3: 300,
    }

    each(cases, (tierRequirement, key) => {
      context(key, () => {
        let camelCaseKey = camelCase(key);

        it(`canOwn returns true if user has a backer tier of ${tierRequirement} or higher`, () => {
          user.backer.tier = tierRequirement;
          expect(backerGear[camelCaseKey].canOwn(user)).to.eql(true);

          user.backer.tier = tierRequirement + 1;
          expect(backerGear[camelCaseKey].canOwn(user)).to.eql(true);
        });

        it('canOwn returns true if user already owns the item', () => {
          user.items.gear.owned[key] = true;
          expect(backerGear[camelCaseKey].canOwn(user)).to.eql(true);
        });

        it('canOwn returns true if user has previously owned the item', () => {
          user.items.gear.owned[key] = false;
          expect(backerGear[camelCaseKey].canOwn(user)).to.eql(true);
        });

        it('canOwn returns false if user does not have tier requirement and did not previously own the item', () => {
          expect(backerGear[camelCaseKey].canOwn(user)).to.eql(false);
        });
      });
    });
  });

  describe('contributor gear', () => {
    let user;

    beforeEach(() => {
      user = {
        contributor: {},
        items: { gear: { owned: {} } },
      };
    });

    let cases = {
      armor_special_1: 2,
      head_special_1: 3,
      shield_special_1: 5,
      weapon_special_1: 4,
    };

    each(cases, (tierRequirement, key) => {
      context(key, () => {
        let camelCaseKey = camelCase(key);

        it(`canOwn returns true if user has a contributor tier of ${tierRequirement} or higher`, () => {
          user.contributor.level = tierRequirement;
          expect(contributorGear[camelCaseKey].canOwn(user)).to.eql(true);

          user.contributor.level = tierRequirement + 1;
          expect(contributorGear[camelCaseKey].canOwn(user)).to.eql(true);
        });

        it('canOwn returns true if user already owns the item', () => {
          user.items.gear.owned[key] = true;
          expect(contributorGear[camelCaseKey].canOwn(user)).to.eql(true);
        });

        it('canOwn returns true if user has previously owned the item', () => {
          user.items.gear.owned[key] = false;
          expect(contributorGear[camelCaseKey].canOwn(user)).to.eql(true);
        });

        it('canOwn returns false if user does not have tier requirement and did not previously own the item', () => {
          expect(contributorGear[camelCaseKey].canOwn(user)).to.eql(false);
        });
      });
    });

    context('hammer of bug smashing', () => {
      it('canOwn returns true if user has a critical flag on their contributor object', () => {
        user.contributor.critical = true;
        expect(contributorGear.weaponSpecialCritical.canOwn(user)).to.eql(true);
      });

      it('canOwn returns true if user already owns the item', () => {
        user.items.gear.owned.weapon_special_critical = true;
        expect(contributorGear.weaponSpecialCritical.canOwn(user)).to.eql(true);
      });

      it('canOwn returns true if user has previously owned the item', () => {
        user.items.gear.owned.weapon_special_critical = false;
        expect(contributorGear.weaponSpecialCritical.canOwn(user)).to.eql(true);
      });

      it('canOwn returns false if user does not have tier requirement and did not previously own the item', () => {
        expect(contributorGear.weaponSpecialCritical.canOwn(user)).to.eql(false);
      });
    });
  });
});
