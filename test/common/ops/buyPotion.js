/* eslint-disable camelcase */
import {
  generateUser,
} from '../../helpers/common.helper';
import buyPotion from '../../../common/script/ops/buyPotion';
import {
  NotAuthorized,
} from '../../../common/script/libs/errors';
import i18n from '../../../common/script/i18n';

describe('shared.ops.buyPotion', () => {
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

  context('Potion', () => {
    it('recovers 15 hp', () => {
      user.stats.hp = 30;
      buyPotion(user);
      expect(user.stats.hp).to.eql(45);
    });

    it('does not increase hp above 50', () => {
      user.stats.hp = 45;
      buyPotion(user);
      expect(user.stats.hp).to.eql(50);
    });

    it('deducts 25 gp', () => {
      user.stats.hp = 45;
      buyPotion(user);

      expect(user.stats.gp).to.eql(175);
    });

    it('does not purchase if not enough gp', (done) => {
      user.stats.hp = 45;
      user.stats.gp = 5;
      try {
        buyPotion(user);
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
        expect(user.stats.hp).to.eql(45);
        expect(user.stats.gp).to.eql(5);

        done();
      }
    });
  });
});
