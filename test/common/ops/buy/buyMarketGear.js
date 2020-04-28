/* eslint-disable camelcase */

import sinon from 'sinon'; // eslint-disable-line no-shadow
import { defaultsDeep } from 'lodash';
import {
  generateUser,
} from '../../../helpers/common.helper';
import { BuyMarketGearOperation } from '../../../../website/common/script/ops/buy/buyMarketGear';
import shared from '../../../../website/common/script';
import {
  BadRequest, NotAuthorized, NotFound,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';
import errorMessage from '../../../../website/common/script/libs/errorMessage';

function buyGear (user, req, analytics) {
  const buyOp = new BuyMarketGearOperation(user, req, analytics);

  return buyOp.purchase();
}

describe('shared.ops.buyMarketGear', () => {
  let user;
  const analytics = { track () {} };

  beforeEach(() => {
    user = generateUser({
      stats: { gp: 200 },
    });

    defaultsDeep(user, {
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
    });

    user.addAchievement = sinon.spy();

    sinon.stub(shared, 'randomVal');
    sinon.stub(shared.onboarding, 'checkOnboardingStatus');
    sinon.stub(shared.fns, 'predictableRandom');
    sinon.stub(analytics, 'track');
  });

  afterEach(() => {
    shared.randomVal.restore();
    shared.fns.predictableRandom.restore();
    shared.onboarding.checkOnboardingStatus.restore();
    analytics.track.restore();
  });

  context('Gear', () => {
    it('adds equipment to inventory', () => {
      user.stats.gp = 31;

      buyGear(user, { params: { key: 'armor_warrior_1' } }, analytics);

      expect(user.items.gear.owned).to.eql({
        weapon_warrior_0: true,
        armor_warrior_1: true,
        eyewear_special_blackTopFrame: true,
        eyewear_special_blueTopFrame: true,
        eyewear_special_greenTopFrame: true,
        eyewear_special_pinkTopFrame: true,
        eyewear_special_redTopFrame: true,
        eyewear_special_whiteTopFrame: true,
        eyewear_special_yellowTopFrame: true,
        headAccessory_special_blackHeadband: true,
        headAccessory_special_blueHeadband: true,
        headAccessory_special_greenHeadband: true,
        headAccessory_special_pinkHeadband: true,
        headAccessory_special_redHeadband: true,
        headAccessory_special_whiteHeadband: true,
        headAccessory_special_yellowHeadband: true,
        eyewear_special_blackHalfMoon: true,
        eyewear_special_blueHalfMoon: true,
        eyewear_special_greenHalfMoon: true,
        eyewear_special_pinkHalfMoon: true,
        eyewear_special_redHalfMoon: true,
        eyewear_special_whiteHalfMoon: true,
        eyewear_special_yellowHalfMoon: true,
      });
      expect(analytics.track).to.be.calledOnce;
    });

    it('adds the onboarding achievement to the user and checks the onboarding status', () => {
      user.stats.gp = 31;

      buyGear(user, { params: { key: 'armor_warrior_1' } }, analytics);

      expect(user.addAchievement).to.be.calledOnce;
      expect(user.addAchievement).to.be.calledWith('purchasedEquipment');

      expect(shared.onboarding.checkOnboardingStatus).to.be.calledOnce;
      expect(shared.onboarding.checkOnboardingStatus).to.be.calledWith(user);
    });

    it('does not add the onboarding achievement to the user if it\'s already been awarded', () => {
      user.stats.gp = 31;
      user.achievements.purchasedEquipment = true;

      buyGear(user, { params: { key: 'armor_warrior_1' } }, analytics);

      expect(user.addAchievement).to.not.be.called;
    });

    it('deducts gold from user', () => {
      user.stats.gp = 31;

      buyGear(user, { params: { key: 'armor_warrior_1' } });

      expect(user.stats.gp).to.eql(1);
    });

    it('auto equips equipment if user has auto-equip preference turned on', () => {
      user.stats.gp = 31;
      user.preferences.autoEquip = true;

      buyGear(user, { params: { key: 'armor_warrior_1' } });

      expect(user.items.gear.equipped).to.have.property('armor', 'armor_warrior_1');
    });

    it('updates the pinnedItems to the next item in the set if one exists', () => {
      user.stats.gp = 31;

      buyGear(user, { params: { key: 'armor_warrior_1' } });

      expect(user.pinnedItems).to.deep.include({
        type: 'marketGear',
        path: 'gear.flat.armor_warrior_2',
      });
    });

    it('buyGears equipment but does not auto-equip', () => {
      user.stats.gp = 31;
      user.preferences.autoEquip = false;

      buyGear(user, { params: { key: 'armor_warrior_1' } });

      expect(user.items.gear.equipped.property).to.not.equal('armor_warrior_1');
    });

    it('does not buyGear equipment twice', done => {
      user.stats.gp = 62;
      buyGear(user, { params: { key: 'armor_warrior_1' } });

      try {
        buyGear(user, { params: { key: 'armor_warrior_1' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('equipmentAlreadyOwned'));
        done();
      }
    });

    it('does not buy equipment of different class', done => {
      user.stats.gp = 82;
      user.stats.class = 'warrior';

      try {
        buyGear(user, { params: { key: 'weapon_special_winter2018Rogue' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('cannotBuyItem'));
        done();
      }
    });

    it('does not buy equipment in bulk', done => {
      user.stats.gp = 82;

      try {
        buyGear(user, { params: { key: 'armor_warrior_1' }, quantity: 3 });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotAbleToBuyInBulk'));
        done();
      }
    });

    // TODO after user.ops.equip is done
    xit('removes one-handed weapon and shield if auto-equip is on and a two-hander is bought', () => {
      user.stats.gp = 100;
      user.preferences.autoEquip = true;
      buyGear(user, { params: { key: 'shield_warrior_1' } });
      user.ops.equip({ params: { key: 'shield_warrior_1' } });
      buyGear(user, { params: { key: 'weapon_warrior_1' } });
      user.ops.equip({ params: { key: 'weapon_warrior_1' } });

      buyGear(user, { params: { key: 'weapon_wizard_1' } });

      expect(user.items.gear.equipped).to.have.property('shield', 'shield_base_0');
      expect(user.items.gear.equipped).to.have.property('weapon', 'weapon_wizard_1');
    });

    // TODO after user.ops.equip is done
    xit('buyGears two-handed equipment but does not automatically remove sword or shield', () => {
      user.stats.gp = 100;
      user.preferences.autoEquip = false;
      buyGear(user, { params: { key: 'shield_warrior_1' } });
      user.ops.equip({ params: { key: 'shield_warrior_1' } });
      buyGear(user, { params: { key: 'weapon_warrior_1' } });
      user.ops.equip({ params: { key: 'weapon_warrior_1' } });

      buyGear(user, { params: { key: 'weapon_wizard_1' } });

      expect(user.items.gear.equipped).to.have.property('shield', 'shield_warrior_1');
      expect(user.items.gear.equipped).to.have.property('weapon', 'weapon_warrior_1');
    });

    it('does not buyGear equipment without enough Gold', done => {
      user.stats.gp = 20;

      try {
        buyGear(user, { params: { key: 'armor_warrior_1' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
        expect(user.items.gear.owned).to.not.have.property('armor_warrior_1');
        done();
      }
    });

    it('returns error when key is not provided', done => {
      try {
        buyGear(user);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(errorMessage('missingKeyParam'));
        done();
      }
    });

    it('returns error when item is not found', done => {
      const params = { key: 'armor_warrior_notExisting' };

      try {
        buyGear(user, { params });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotFound);
        expect(err.message).to.equal(errorMessage('itemNotFound', params));
        done();
      }
    });

    it('does not buyGear equipment without the previous equipment', done => {
      try {
        buyGear(user, { params: { key: 'armor_warrior_2' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('previousGearNotOwned'));
        done();
      }
    });

    it('does not buyGear equipment if user does not own prior item in sequence', done => {
      user.stats.gp = 200;

      try {
        buyGear(user, { params: { key: 'armor_warrior_2' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('previousGearNotOwned'));
        expect(user.items.gear.owned).to.not.have.property('armor_warrior_2');
        done();
      }
    });

    it('does buyGear equipment if item is a numbered special item user qualifies for', () => {
      user.stats.gp = 200;
      user.items.gear.owned.head_special_2 = false;

      buyGear(user, { params: { key: 'head_special_2' } });

      expect(user.items.gear.owned).to.have.property('head_special_2', true);
    });

    it('does buyGear equipment if it is an armoire item that an user previously lost', () => {
      user.stats.gp = 200;
      user.items.gear.owned.shield_armoire_ramHornShield = false;

      buyGear(user, { params: { key: 'shield_armoire_ramHornShield' } });

      expect(user.items.gear.owned).to.have.property('shield_armoire_ramHornShield', true);
    });
  });
});
