/* eslint-disable camelcase */
import {
  generateUser,
} from '../../helpers/common.helper';
import buy from '../../../website/common/script/ops/buy';
import {
  BadRequest,
} from '../../../website/common/script/libs/errors';
import i18n from '../../../website/common/script/i18n';

describe('shared.ops.buy', () => {
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
      buy(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('missingKeyParam'));
      done();
    }
  });

  it('recovers 15 hp', () => {
    user.stats.hp = 30;
    buy(user, {params: {key: 'potion'}});
    expect(user.stats.hp).to.eql(45);
  });

  it('adds equipment to inventory', () => {
    user.stats.gp = 31;
    buy(user, {params: {key: 'armor_warrior_1'}});
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
});
