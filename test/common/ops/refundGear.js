/* eslint-disable camelcase */

import sinon from 'sinon'; // eslint-disable-line no-shadow
import {
  generateUser,
} from '../../helpers/common.helper';
import refundGear from '../../../website/common/script/ops/refundGear';
import shared from '../../../website/common/script';

describe('shared.ops.refundGear', () => {
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
    it('removes equipment', () => {
      user.stats.gp = 31;

      refundGear(user, {params: {key: 'armor_warrior_1'}});

      expect(user.items.gear.owned).to.eql({
        weapon_warrior_0: true,
        armor_warrior_1: false,
        eyewear_special_blackTopFrame: true,
        eyewear_special_blueTopFrame: true,
        eyewear_special_greenTopFrame: true,
        eyewear_special_pinkTopFrame: true,
        eyewear_special_redTopFrame: true,
        eyewear_special_whiteTopFrame: true,
        eyewear_special_yellowTopFrame: true,
      });
    });

    it('refunds gold from user', () => {
      user.stats.gp = 31;

      refundGear(user, {params: {key: 'armor_warrior_1'}});

      expect(user.stats.gp).to.eql(61);
    });

    it('unequips equipment', () => {
      user.stats.gp = 31;
      user.items.gear.equipped.weapon = 'armor_warrior_1';

      refundGear(user, {params: {key: 'armor_warrior_1'}});

      expect(user.items.gear.equipped).to.have.property('armor', 'armor_base_0');
    });
  });
});
