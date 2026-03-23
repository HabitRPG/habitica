/* eslint-disable camelcase */
import {
  generateUser,
} from '../../../helpers/common.helper';
import { BuyHealthPotionOperation } from '../../../../website/common/script/ops/buy/buyHealthPotion';
import {
  NotAuthorized,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';

describe('shared.ops.buyHealthPotion', () => {
  let user;

  async function buyHealthPotion (_user, _req) {
    const buyOp = new BuyHealthPotionOperation(_user, _req);

    return buyOp.purchase();
  }

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
    it('recovers 15 hp', async () => {
      user.stats.hp = 30;
      await buyHealthPotion(user, {});
      expect(user.stats.hp).to.eql(45);
    });

    it('does not increase hp above 50', async () => {
      user.stats.hp = 45;
      await buyHealthPotion(user);
      expect(user.stats.hp).to.eql(50);
    });

    it('deducts 25 gp', async () => {
      user.stats.hp = 45;
      await buyHealthPotion(user);

      expect(user.stats.gp).to.eql(175);
    });

    it('does not purchase if not enough gp', async () => {
      user.stats.hp = 45;
      user.stats.gp = 5;
      try {
        await buyHealthPotion(user);
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
        expect(user.stats.hp).to.eql(45);
        expect(user.stats.gp).to.eql(5);
      }
    });

    it('does not purchase if hp is full', async () => {
      user.stats.hp = 50;
      user.stats.gp = 40;
      try {
        await buyHealthPotion(user);
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageHealthAlreadyMax'));
        expect(user.stats.hp).to.eql(50);
        expect(user.stats.gp).to.eql(40);
      }
    });

    it('does not allow potion purchases when hp is zero', async () => {
      user.stats.hp = 0;
      user.stats.gp = 40;
      try {
        await buyHealthPotion(user);
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageHealthAlreadyMin'));
        expect(user.stats.hp).to.eql(0);
        expect(user.stats.gp).to.eql(40);
      }
    });

    it('does not allow potion purchases when hp is negative', async () => {
      user.stats.hp = -8;
      user.stats.gp = 40;
      try {
        await buyHealthPotion(user);
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageHealthAlreadyMin'));
        expect(user.stats.hp).to.eql(-8);
        expect(user.stats.gp).to.eql(40);
      }
    });
  });
});
