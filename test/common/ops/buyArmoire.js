/* eslint-disable camelcase */

import {
  generateUser,
} from '../../helpers/common.helper';
import count from '../../../website/common/script/count';
import buyArmoire from '../../../website/common/script/ops/buyArmoire';
import content from '../../../website/common/script/content/index';
import {
  NotAuthorized,
} from '../../../website/common/script/libs/errors';
import i18n from '../../../website/common/script/i18n';

function getFullArmoire () {
  let fullArmoire = {};

  _(content.gearTypes).each((type) => {
    _(content.gear.tree[type].armoire).each((gearObject) => {
      let armoireKey = gearObject.key;

      fullArmoire[armoireKey] = true;
    }).value();
  }).value();

  return fullArmoire;
}

describe('shared.ops.buyArmoire', () => {
  let user;
  let YIELD_EQUIPMENT = 0.5;
  let YIELD_FOOD = 0.7;
  let YIELD_EXP = 0.9;

  beforeEach(() => {
    user = generateUser({
      stats: { gp: 200 },
    });
    user.items.gear.owned = {
      weapon_warrior_0: true,
    };
    user.achievements.ultimateGearSets = { rogue: true };
    user.flags.armoireOpened = true;
    user.stats.exp = 0;
    user.items.food = {};

    sandbox.stub(Math, 'random');
  });

  afterEach(() => {
    Math.random.restore();
  });

  context('failure conditions', () => {
    it('does not open if user does not have enough gold', (done) => {
      user.stats.gp = 50;

      try {
        buyArmoire(user);
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
        expect(user.items.gear.owned).to.eql({
          weapon_warrior_0: true,
        });
        expect(user.items.food).to.be.empty;
        expect(user.stats.exp).to.eql(0);
        done();
      }
    });

    it('does not open without Ultimate Gear achievement', (done) => {
      user.achievements.ultimateGearSets = {healer: false, wizard: false, rogue: false, warrior: false};

      try {
        buyArmoire(user);
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('cannotBuyItem'));
        expect(user.items.gear.owned).to.eql({
          weapon_warrior_0: true,
        });
        expect(user.items.food).to.be.empty;
        expect(user.stats.exp).to.eql(0);
        done();
      }
    });
  });

  context('non-gear awards', () => {
    it('gives Experience', () => {
      let previousExp = user.stats.exp;
      Math.random.returns(YIELD_EXP);

      buyArmoire(user);

      expect(user.items.gear.owned).to.eql({weapon_warrior_0: true});
      expect(user.items.food).to.be.empty;
      expect(user.stats.exp).to.be.greaterThan(previousExp);
      expect(user.stats.gp).to.equal(100);
    });

    it('gives food', () => {
      let previousExp = user.stats.exp;

      Math.random.returns(YIELD_FOOD);

      buyArmoire(user);

      expect(user.items.gear.owned).to.eql({weapon_warrior_0: true});
      expect(user.items.food).to.not.be.empty;
      expect(user.stats.exp).to.equal(previousExp);
      expect(user.stats.gp).to.equal(100);
    });

    it('does not give equipment if all equipment has been found', () => {
      Math.random.returns(YIELD_EQUIPMENT);
      user.items.gear.owned = getFullArmoire();
      user.stats.gp = 150;

      buyArmoire(user);

      expect(user.items.gear.owned).to.eql(getFullArmoire());
      let armoireCount = count.remainingGearInSet(user.items.gear.owned, 'armoire');

      expect(armoireCount).to.eql(0);

      expect(user.stats.gp).to.equal(50);
    });
  });

  context('gear awards', () => {
    it('always drops equipment the first time', () => {
      delete user.flags.armoireOpened;
      Math.random.returns(YIELD_EXP);

      expect(_.size(user.items.gear.owned)).to.equal(1);

      buyArmoire(user);

      expect(_.size(user.items.gear.owned)).to.equal(2);

      let armoireCount = count.remainingGearInSet(user.items.gear.owned, 'armoire');

      expect(armoireCount).to.eql(_.size(getFullArmoire()) - 1);
      expect(user.items.food).to.be.empty;
      expect(user.stats.exp).to.equal(0);
      expect(user.stats.gp).to.equal(100);
    });

    it('gives more equipment', () => {
      Math.random.returns(YIELD_EQUIPMENT);
      user.items.gear.owned = {
        weapon_warrior_0: true,
        head_armoire_hornedIronHelm: true,
      };
      user.stats.gp = 200;

      expect(_.size(user.items.gear.owned)).to.equal(2);

      buyArmoire(user);

      expect(_.size(user.items.gear.owned)).to.equal(3);

      let armoireCount = count.remainingGearInSet(user.items.gear.owned, 'armoire');

      expect(armoireCount).to.eql(_.size(getFullArmoire()) - 2);
      expect(user.stats.gp).to.eql(100);
    });
  });
});
