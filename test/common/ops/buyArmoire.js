/* eslint-disable camelcase */

import sinon from 'sinon'; // eslint-disable-line no-shadow
import {
  generateUser,
} from '../../helpers/common.helper';
import count from '../../../website/common/script/count';
import buyArmoire from '../../../website/common/script/ops/buyArmoire';
import shared from '../../../website/common/script';
import content from '../../../website/common/script/content/index';
import {
  NotAuthorized,
} from '../../../website/common/script/libs/errors';
import i18n from '../../../website/common/script/i18n';

describe('shared.ops.buyArmoire', () => {
  let user;
  let YIELD_EQUIPMENT = 0.5;
  let YIELD_FOOD = 0.7;
  let YIELD_EXP = 0.9;

  let fullArmoire = {};

  _(content.gearTypes).each((type) => {
    _(content.gear.tree[type].armoire).each((gearObject) => {
      let armoireKey = gearObject.key;

      fullArmoire[armoireKey] = true;
    }).value();
  }).value();


  beforeEach(() => {
    user = generateUser({
      items: {
        gear: {
          owned: {
            weapon_warrior_0: true,
          },
          equipped: {
            weapon_warrior_0: true,
          },
        },
      },
      stats: { gp: 200 },
    });

    user.achievements.ultimateGearSets = { rogue: true };
    user.flags.armoireOpened = true;
    user.stats.exp = 0;
    user.items.food = {};

    sinon.stub(shared.fns, 'randomVal');
    sinon.stub(shared.fns, 'predictableRandom');
  });

  afterEach(() => {
    shared.fns.randomVal.restore();
    shared.fns.predictableRandom.restore();
  });

  context('failure conditions', () => {
    it('does not open if user does not have enough gold', (done) => {
      shared.fns.predictableRandom.returns(YIELD_EQUIPMENT);
      user.stats.gp = 50;

      try {
        buyArmoire(user);
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
        expect(user.items.gear.owned).to.eql({
          weapon_warrior_0: true,
          eyewear_special_blackTopFrame: true,
          eyewear_special_blueTopFrame: true,
          eyewear_special_greenTopFrame: true,
          eyewear_special_pinkTopFrame: true,
          eyewear_special_redTopFrame: true,
          eyewear_special_whiteTopFrame: true,
          eyewear_special_yellowTopFrame: true,
        });
        expect(user.items.food).to.be.empty;
        expect(user.stats.exp).to.eql(0);
        done();
      }
    });

    it('does not open without Ultimate Gear achievement', (done) => {
      shared.fns.predictableRandom.returns(YIELD_EQUIPMENT);
      user.achievements.ultimateGearSets = {healer: false, wizard: false, rogue: false, warrior: false};

      try {
        buyArmoire(user);
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('cannotBuyItem'));
        expect(user.items.gear.owned).to.eql({
          weapon_warrior_0: true,
          eyewear_special_blackTopFrame: true,
          eyewear_special_blueTopFrame: true,
          eyewear_special_greenTopFrame: true,
          eyewear_special_pinkTopFrame: true,
          eyewear_special_redTopFrame: true,
          eyewear_special_whiteTopFrame: true,
          eyewear_special_yellowTopFrame: true,
        });
        expect(user.items.food).to.be.empty;
        expect(user.stats.exp).to.eql(0);
        done();
      }
    });
  });

  context('non-gear awards', () => {
    // Skipped because can't stub predictableRandom correctly
    xit('gives Experience', () => {
      shared.fns.predictableRandom.returns(YIELD_EXP);

      buyArmoire(user);

      expect(user.items.gear.owned).to.eql({weapon_warrior_0: true});
      expect(user.items.food).to.be.empty;
      expect(user.stats.exp).to.eql(46);
      expect(user.stats.gp).to.eql(100);
    });

    // Skipped because can't stub predictableRandom correctly
    xit('gives food', () => {
      let honey = content.food.Honey;

      shared.fns.randomVal.returns(honey);
      shared.fns.predictableRandom.returns(YIELD_FOOD);

      buyArmoire(user);

      expect(user.items.gear.owned).to.eql({weapon_warrior_0: true});
      expect(user.items.food).to.eql({Honey: 1});
      expect(user.stats.exp).to.eql(0);
      expect(user.stats.gp).to.eql(100);
    });

    // Skipped because can't stub predictableRandom correctly
    xit('does not give equipment if all equipment has been found', () => {
      shared.fns.predictableRandom.returns(YIELD_EQUIPMENT);
      user.items.gear.owned = fullArmoire;
      user.stats.gp = 150;

      buyArmoire(user);

      expect(user.items.gear.owned).to.eql(fullArmoire);
      let armoireCount = count.remainingGearInSet(user.items.gear.owned, 'armoire');

      expect(armoireCount).to.eql(0);

      expect(user.stats.exp).to.eql(30);
      expect(user.stats.gp).to.eql(50);
    });
  });

  context('gear awards', () => {
    beforeEach(() => {
      let shield = content.gear.tree.shield.armoire.gladiatorShield;

      shared.fns.randomVal.returns(shield);
    });

    // Skipped because can't stub predictableRandom correctly
    xit('always drops equipment the first time', () => {
      delete user.flags.armoireOpened;
      shared.fns.predictableRandom.returns(YIELD_EXP);

      buyArmoire(user);

      expect(user.items.gear.owned).to.eql({
        weapon_warrior_0: true,
        shield_armoire_gladiatorShield: true,
      });

      let armoireCount = count.remainingGearInSet(user.items.gear.owned, 'armoire');

      expect(armoireCount).to.eql(_.size(fullArmoire) - 1);
      expect(user.items.food).to.be.empty;
      expect(user.stats.exp).to.eql(0);
      expect(user.stats.gp).to.eql(100);
    });

    // Skipped because can't stub predictableRandom correctly
    xit('gives more equipment', () => {
      shared.fns.predictableRandom.returns(YIELD_EQUIPMENT);
      user.items.gear.owned = {
        weapon_warrior_0: true,
        head_armoire_hornedIronHelm: true,
      };
      user.stats.gp = 200;

      buyArmoire(user);

      expect(user.items.gear.owned).to.eql({weapon_warrior_0: true, shield_armoire_gladiatorShield: true, head_armoire_hornedIronHelm: true});
      let armoireCount = count.remainingGearInSet(user.items.gear.owned, 'armoire');

      expect(armoireCount).to.eql(_.size(fullArmoire) - 2);
      expect(user.stats.gp).to.eql(100);
    });
  });
});
