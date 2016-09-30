/* eslint-disable camelcase */

import sinon from 'sinon'; // eslint-disable-line no-shadow
import {
  generateUser,
} from '../../helpers/common.helper';
import buyGear from '../../../website/common/script/ops/buyGear';
import shared from '../../../website/common/script';
import {
  NotAuthorized,
} from '../../../website/common/script/libs/errors';
import i18n from '../../../website/common/script/i18n';

describe('shared.ops.buyGear', () => {
  let user;

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

    sinon.stub(shared, 'randomVal');
    sinon.stub(shared.fns, 'predictableRandom');
  });

  afterEach(() => {
    shared.randomVal.restore();
    shared.fns.predictableRandom.restore();
  });

  context('Gear', () => {
    it('adds equipment to inventory', () => {
      user.stats.gp = 31;

      buyGear(user, {params: {key: 'armor_warrior_1'}});

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
      });
    });

    it('deducts gold from user', () => {
      user.stats.gp = 31;

      buyGear(user, {params: {key: 'armor_warrior_1'}});

      expect(user.stats.gp).to.eql(1);
    });

    it('auto equips equipment if user has auto-equip preference turned on', () => {
      user.stats.gp = 31;
      user.preferences.autoEquip = true;

      buyGear(user, {params: {key: 'armor_warrior_1'}});

      expect(user.items.gear.equipped).to.have.property('armor', 'armor_warrior_1');
    });

    it('buyGears equipment but does not auto-equip', () => {
      user.stats.gp = 31;
      user.preferences.autoEquip = false;

      buyGear(user, {params: {key: 'armor_warrior_1'}});

      expect(user.items.gear.equipped.property).to.not.equal('armor_warrior_1');
    });

    it('does not buyGear equipment twice', (done) => {
      user.stats.gp = 62;
      buyGear(user, {params: {key: 'armor_warrior_1'}});

      try {
        buyGear(user, {params: {key: 'armor_warrior_1'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('equipmentAlreadyOwned'));
        done();
      }
    });

    // TODO after user.ops.equip is done
    xit('removes one-handed weapon and shield if auto-equip is on and a two-hander is bought', () => {
      user.stats.gp = 100;
      user.preferences.autoEquip = true;
      buyGear(user, {params: {key: 'shield_warrior_1'}});
      user.ops.equip({params: {key: 'shield_warrior_1'}});
      buyGear(user, {params: {key: 'weapon_warrior_1'}});
      user.ops.equip({params: {key: 'weapon_warrior_1'}});

      buyGear(user, {params: {key: 'weapon_wizard_1'}});

      expect(user.items.gear.equipped).to.have.property('shield', 'shield_base_0');
      expect(user.items.gear.equipped).to.have.property('weapon', 'weapon_wizard_1');
    });

    // TODO after user.ops.equip is done
    xit('buyGears two-handed equipment but does not automatically remove sword or shield', () => {
      user.stats.gp = 100;
      user.preferences.autoEquip = false;
      buyGear(user, {params: {key: 'shield_warrior_1'}});
      user.ops.equip({params: {key: 'shield_warrior_1'}});
      buyGear(user, {params: {key: 'weapon_warrior_1'}});
      user.ops.equip({params: {key: 'weapon_warrior_1'}});

      buyGear(user, {params: {key: 'weapon_wizard_1'}});

      expect(user.items.gear.equipped).to.have.property('shield', 'shield_warrior_1');
      expect(user.items.gear.equipped).to.have.property('weapon', 'weapon_warrior_1');
    });

    it('does not buyGear equipment without enough Gold', (done) => {
      user.stats.gp = 20;

      try {
        buyGear(user, {params: {key: 'armor_warrior_1'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
        expect(user.items.gear.owned).to.not.have.property('armor_warrior_1');
        done();
      }
    });
  });
});
