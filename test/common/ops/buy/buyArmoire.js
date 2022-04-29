/* eslint-disable camelcase */

import {
  generateUser,
} from '../../../helpers/common.helper';
import * as count from '../../../../website/common/script/count';
import { BuyArmoireOperation } from '../../../../website/common/script/ops/buy/buyArmoire';
import * as randomValFns from '../../../../website/common/script/libs/randomVal';
import content from '../../../../website/common/script/content/index';
import {
  NotAuthorized,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';

function getFullArmoire () {
  const fullArmoire = {};

  _.each(content.gearTypes, type => {
    _.each(content.gear.tree[type].armoire, gearObject => {
      const armoireKey = gearObject.key;

      fullArmoire[armoireKey] = true;
    });
  });

  return fullArmoire;
}

describe('shared.ops.buyArmoire', () => {
  let user;
  const YIELD_EQUIPMENT = 0.5;
  const YIELD_FOOD = 0.7;
  const YIELD_EXP = 0.9;
  const analytics = { track () {} };

  async function buyArmoire (_user, _req, _analytics) {
    const buyOp = new BuyArmoireOperation(_user, _req, _analytics);

    return buyOp.purchase();
  }

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

    sandbox.stub(randomValFns, 'trueRandom');
    sinon.stub(analytics, 'track');
  });

  afterEach(() => {
    randomValFns.trueRandom.restore();
    analytics.track.restore();
  });

  context('failure conditions', () => {
    it('does not open if user does not have enough gold', async () => {
      user.stats.gp = 50;

      try {
        await buyArmoire(user);
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
        expect(user.items.gear.owned).to.eql({
          weapon_warrior_0: true,
        });
        expect(user.items.food).to.be.empty;
        expect(user.stats.exp).to.eql(0);
      }
    });
  });

  context('non-gear awards', () => {
    it('gives Experience', async () => {
      const previousExp = user.stats.exp;
      randomValFns.trueRandom.returns(YIELD_EXP);

      await buyArmoire(user);

      expect(user.items.gear.owned).to.eql({ weapon_warrior_0: true });
      expect(user.items.food).to.be.empty;
      expect(user.stats.exp).to.be.greaterThan(previousExp);
      expect(user.stats.gp).to.equal(100);
    });

    it('gives food', async () => {
      const previousExp = user.stats.exp;

      randomValFns.trueRandom.returns(YIELD_FOOD);

      await buyArmoire(user);

      expect(user.items.gear.owned).to.eql({ weapon_warrior_0: true });
      expect(user.items.food).to.not.be.empty;
      expect(user.stats.exp).to.equal(previousExp);
      expect(user.stats.gp).to.equal(100);
    });

    it('does not give equipment if all equipment has been found', async () => {
      randomValFns.trueRandom.returns(YIELD_EQUIPMENT);
      user.items.gear.owned = getFullArmoire();
      user.stats.gp = 150;

      await buyArmoire(user);

      expect(user.items.gear.owned).to.eql(getFullArmoire());
      const armoireCount = count.remainingGearInSet(user.items.gear.owned, 'armoire');

      expect(armoireCount).to.eql(0);

      expect(user.stats.gp).to.equal(50);
    });
  });

  context('gear awards', () => {
    it('always drops equipment the first time', async () => {
      delete user.flags.armoireOpened;
      randomValFns.trueRandom.returns(YIELD_EXP);

      expect(_.size(user.items.gear.owned)).to.equal(1);

      await buyArmoire(user);

      expect(_.size(user.items.gear.owned)).to.equal(2);

      const armoireCount = count.remainingGearInSet(user.items.gear.owned, 'armoire');

      expect(armoireCount).to.eql(_.size(getFullArmoire()) - 1);
      expect(user.items.food).to.be.empty;
      expect(user.stats.exp).to.equal(0);
      expect(user.stats.gp).to.equal(100);
    });

    it('gives more equipment', async () => {
      randomValFns.trueRandom.returns(YIELD_EQUIPMENT);
      user.items.gear.owned = {
        weapon_warrior_0: true,
        head_armoire_hornedIronHelm: true,
      };
      user.stats.gp = 200;

      expect(_.size(user.items.gear.owned)).to.equal(2);

      await buyArmoire(user, {}, analytics);

      expect(_.size(user.items.gear.owned)).to.equal(3);

      const armoireCount = count.remainingGearInSet(user.items.gear.owned, 'armoire');

      expect(armoireCount).to.eql(_.size(getFullArmoire()) - 2);
      expect(user.stats.gp).to.eql(100);
      expect(analytics.track).to.be.calledTwice;
    });
  });
});
