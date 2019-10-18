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

function buyGem (user, req, analytics) {
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
    it('purchases gems', () => {
      const [, message] = buyGem(user, { params: { type: 'gems', key: 'gem' } }, analytics);

      expect(message).to.equal(i18n.t('plusGem', { count: 1 }));
      expect(user.balance).to.equal(userGemAmount + 0.25);
      expect(user.purchased.plan.gemsBought).to.equal(1);
      expect(user.stats.gp).to.equal(goldPoints - planGemLimits.convRate);
      expect(analytics.track).to.be.calledOnce;
    });

    it('purchases gems with a different language than the default', () => {
      const [, message] = buyGem(user, { params: { type: 'gems', key: 'gem' }, language: 'de' });

      expect(message).to.equal(i18n.t('plusGem', { count: 1 }, 'de'));
      expect(user.balance).to.equal(userGemAmount + 0.25);
      expect(user.purchased.plan.gemsBought).to.equal(1);
      expect(user.stats.gp).to.equal(goldPoints - planGemLimits.convRate);
    });

    it('makes bulk purchases of gems', () => {
      const [, message] = buyGem(user, {
        params: { type: 'gems', key: 'gem' },
        quantity: 2,
      });

      expect(message).to.equal(i18n.t('plusGem', { count: 2 }));
      expect(user.balance).to.equal(userGemAmount + 0.50);
      expect(user.purchased.plan.gemsBought).to.equal(2);
      expect(user.stats.gp).to.equal(goldPoints - planGemLimits.convRate * 2);
    });


    context('Failure conditions', () => {
      it('returns an error when key is not provided', done => {
        try {
          buyGem(user, { params: { type: 'gems' } });
        } catch (err) {
          expect(err).to.be.an.instanceof(BadRequest);
          expect(err.message).to.equal(i18n.t('missingKeyParam'));
          done();
        }
      });

      it('prevents unsubscribed user from buying gems', done => {
        delete user.purchased.plan.customerId;

        try {
          buyGem(user, { params: { type: 'gems', key: 'gem' } });
        } catch (err) {
          expect(err).to.be.an.instanceof(NotAuthorized);
          expect(err.message).to.equal(i18n.t('mustSubscribeToPurchaseGems'));
          done();
        }
      });

      it('prevents user with not enough gold from buying gems', done => {
        user.stats.gp = 15;

        try {
          buyGem(user, { params: { type: 'gems', key: 'gem' } });
        } catch (err) {
          expect(err).to.be.an.instanceof(NotAuthorized);
          expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
          done();
        }
      });

      it('prevents user that have reached the conversion cap from buying gems', done => {
        user.stats.gp = goldPoints;
        user.purchased.plan.gemsBought = gemsBought;

        try {
          buyGem(user, { params: { type: 'gems', key: 'gem' } });
        } catch (err) {
          expect(err).to.be.an.instanceof(NotAuthorized);
          expect(err.message).to.equal(i18n.t('reachedGoldToGemCap', { convCap: planGemLimits.convCap }));
          done();
        }
      });

      it('prevents user from buying an invalid quantity', done => {
        user.stats.gp = goldPoints;
        user.purchased.plan.gemsBought = gemsBought;

        try {
          buyGem(user, { params: { type: 'gems', key: 'gem' }, quantity: 'a' });
        } catch (err) {
          expect(err).to.be.an.instanceof(BadRequest);
          expect(err.message).to.equal(i18n.t('invalidQuantity'));
          done();
        }
      });
    });
  });
});
