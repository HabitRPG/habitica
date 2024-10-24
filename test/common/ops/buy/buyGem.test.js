/* eslint-disable camelcase */

import sinon from 'sinon'; // eslint-disable-line no-shadow
import {
  generateUser,
} from '../../../helpers/common.helper';
import {
  BadRequest, NotAuthorized,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';
import { BuyGemOperation } from '../../../../website/common/script/ops/buy/buyGem';
import planGemLimits from '../../../../website/common/script/libs/planGemLimits';

async function buyGem (user, req, analytics) {
  const buyOp = new BuyGemOperation(user, req, analytics);

  return buyOp.purchase();
}

describe('shared.ops.buyGem', () => {
  let user;
  const analytics = { track () {} };
  const goldPoints = 40;
  const gemsBought = 40;
  const userGemAmount = 10;

  beforeEach(() => {
    user = generateUser({
      stats: { gp: goldPoints },
      balance: userGemAmount,
      purchased: {
        plan: {
          gemsBought: 0,
          customerId: 'costumer-id',
        },
      },
    });

    sinon.stub(analytics, 'track');
  });

  afterEach(() => {
    analytics.track.restore();
  });

  context('Gems', () => {
    it('purchases gems', async () => {
      const [, message] = await buyGem(user, { params: { type: 'gems', key: 'gem' } }, analytics);

      expect(message).to.equal(i18n.t('plusGem', { count: 1 }));
      expect(user.balance).to.equal(userGemAmount + 0.25);
      expect(user.purchased.plan.gemsBought).to.equal(1);
      expect(user.stats.gp).to.equal(goldPoints - planGemLimits.convRate);
      expect(analytics.track).to.be.calledOnce;
    });

    it('purchases gems with a different language than the default', async () => {
      const [, message] = await buyGem(user, { params: { type: 'gems', key: 'gem' }, language: 'de' });

      expect(message).to.equal(i18n.t('plusGem', { count: 1 }, 'de'));
      expect(user.balance).to.equal(userGemAmount + 0.25);
      expect(user.purchased.plan.gemsBought).to.equal(1);
      expect(user.stats.gp).to.equal(goldPoints - planGemLimits.convRate);
    });

    it('makes bulk purchases of gems', async () => {
      const [, message] = await buyGem(user, {
        params: { type: 'gems', key: 'gem' },
        quantity: 2,
      });

      expect(message).to.equal(i18n.t('plusGem', { count: 2 }));
      expect(user.balance).to.equal(userGemAmount + 0.50);
      expect(user.purchased.plan.gemsBought).to.equal(2);
      expect(user.stats.gp).to.equal(goldPoints - planGemLimits.convRate * 2);
    });

    context('Failure conditions', () => {
      it('returns an error when key is not provided', async () => {
        try {
          await buyGem(user, { params: { type: 'gems' } });
        } catch (err) {
          expect(err).to.be.an.instanceof(BadRequest);
          expect(err.message).to.equal(i18n.t('missingKeyParam'));
        }
      });

      it('prevents unsubscribed user from buying gems', async () => {
        delete user.purchased.plan.customerId;

        try {
          await buyGem(user, { params: { type: 'gems', key: 'gem' } });
        } catch (err) {
          expect(err).to.be.an.instanceof(NotAuthorized);
          expect(err.message).to.equal(i18n.t('mustSubscribeToPurchaseGems'));
        }
      });

      it('prevents user with not enough gold from buying gems', async () => {
        user.stats.gp = 15;

        try {
          await buyGem(user, { params: { type: 'gems', key: 'gem' } });
        } catch (err) {
          expect(err).to.be.an.instanceof(NotAuthorized);
          expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
        }
      });

      it('prevents user that have reached the conversion cap from buying gems', async () => {
        user.stats.gp = goldPoints;
        user.purchased.plan.gemsBought = gemsBought;

        try {
          await buyGem(user, { params: { type: 'gems', key: 'gem' } });
        } catch (err) {
          expect(err).to.be.an.instanceof(NotAuthorized);
          expect(err.message).to.equal(i18n.t('maxBuyGems', { convCap: planGemLimits.convCap }));
        }
      });

      it('prevents user from buying an invalid quantity', async () => {
        user.stats.gp = goldPoints;
        user.purchased.plan.gemsBought = gemsBought;

        try {
          await buyGem(user, { params: { type: 'gems', key: 'gem' }, quantity: 'a' });
        } catch (err) {
          expect(err).to.be.an.instanceof(BadRequest);
          expect(err.message).to.equal(i18n.t('invalidQuantity'));
        }
      });
    });
  });
});
