/* eslint-disable camelcase */
import {
  generateUser,
} from '../../helpers/common.helper';
import refund from '../../../website/common/script/ops/refund';
import {
  BadRequest,
} from '../../../website/common/script/libs/errors';
import i18n from '../../../website/common/script/i18n';

describe('shared.ops.refund', () => {
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
  });

  it('returns error when key is not provided', (done) => {
    try {
      refund(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('missingKeyParam'));
      done();
    }
  });

  xit('recovers 15 hp', () => {
    user.stats.hp = 30;
    refund(user, {params: {key: 'potion'}});
    expect(user.stats.hp).to.eql(45);
  });

  it('refunds equipment', () => {
    user.stats.gp = 31;
    refund(user, {params: {key: 'weapon_warrior_0'}});
    expect(user.items.gear.owned).to.eql({
      eyewear_special_blackTopFrame: true,
      eyewear_special_blueTopFrame: true,
      eyewear_special_greenTopFrame: true,
      eyewear_special_pinkTopFrame: true,
      eyewear_special_redTopFrame: true,
      eyewear_special_whiteTopFrame: true,
      eyewear_special_yellowTopFrame: true,
      weapon_warrior_0: false,
    });
  });
});
