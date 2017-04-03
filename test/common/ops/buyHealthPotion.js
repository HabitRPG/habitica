/* eslint-disable camelcase */
import {
  generateUser,
} from '../../helpers/common.helper';
import buyHealthPotion from '../../../website/common/script/ops/buyHealthPotion';
import {
  NotAuthorized,
} from '../../../website/common/script/libs/errors';
import i18n from '../../../website/common/script/i18n';

describe('shared.ops.buyHealthPotion', () => {
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
      buyHealthPotion(user);
      expect(user.stats.hp).to.eql(45);
    });

    it('does not increase hp above 50', () => {
      user.stats.hp = 45;
      buyHealthPotion(user);
      expect(user.stats.hp).to.eql(50);
    });

    it('deducts 25 gp', () => {
      user.stats.hp = 45;
      buyHealthPotion(user);

      expect(user.stats.gp).to.eql(175);
    });

    it('does not purchase if not enough gp', (done) => {
      user.stats.hp = 45;
      user.stats.gp = 5;
      try {
        buyHealthPotion(user);
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
        expect(user.stats.hp).to.eql(45);
        expect(user.stats.gp).to.eql(5);

        done();
      }
    });

    it('does not purchase if hp is full', (done) => {
      user.stats.hp = 50;
      user.stats.gp = 40;
      try {
        buyHealthPotion(user);
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageHealthAlreadyMax'));
        expect(user.stats.hp).to.eql(50);
        expect(user.stats.gp).to.eql(40);

        done();
      }
    });
  });
});
