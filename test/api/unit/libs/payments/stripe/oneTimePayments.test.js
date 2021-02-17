import apiError from '../../../../../../website/server/libs/apiError';
import common from '../../../../../../website/common';
import {
  getOneTimePaymentInfo,
  applyGemPayment,
} from '../../../../../../website/server/libs/payments/stripe/oneTimePayments';
import * as subscriptions from '../../../../../../website/server/libs/payments/stripe/subscriptions';
import { model as User } from '../../../../../../website/server/models/user';
import payments from '../../../../../../website/server/libs/payments/payments';

const { i18n } = common;

describe('Stripe - One Time Payments', () => {
  describe('getOneTimePaymentInfo', () => {
    let user;

    beforeEach(() => {
      user = new User();
      sandbox.stub(subscriptions, 'checkSubData');
    });

    describe('gemsBlock', () => {
      it('returns the gemsBlock and amount', async () => {
        const { gemsBlock, amount, subscription } = await getOneTimePaymentInfo('21gems', null, user);
        expect(gemsBlock).to.equal(common.content.gems['21gems']);
        expect(amount).to.equal(gemsBlock.price);
        expect(amount).to.equal(499);
        expect(subscription).to.be.null;
        expect(subscriptions.checkSubData).to.not.be.called;
      });

      it('throws if the gemsBlock does not exist', async () => {
        await expect(getOneTimePaymentInfo('not existant', null, user))
          .to.eventually.be.rejected.and.to.eql({
            httpCode: 400,
            name: 'BadRequest',
            message: apiError('invalidGemsBlock'),
          });
      });

      it('throws if the user cannot receive gems', async () => {
        sandbox.stub(user, 'canGetGems').resolves(false);
        await expect(getOneTimePaymentInfo('21gems', null, user))
          .to.eventually.be.rejected.and.to.eql({
            httpCode: 401,
            name: 'NotAuthorized',
            message: i18n.t('groupPolicyCannotGetGems'),
          });
      });
    });

    describe('gift', () => {
      it('throws if the receiver does not exist', async () => {
        const gift = {
          type: 'gems',
          uuid: 'invalid',
          gems: {
            amount: 3,
          },
        };

        await expect(getOneTimePaymentInfo(null, gift, user))
          .to.eventually.be.rejected.and.to.eql({
            httpCode: 404,
            name: 'NotFound',
            message: i18n.t('userWithIDNotFound', { userId: 'invalid' }),
          });
      });

      it('throws if the user cannot receive gems', async () => {
        const receivingUser = new User();
        await receivingUser.save();
        sandbox.stub(User.prototype, 'canGetGems').resolves(false);

        const gift = {
          type: 'gems',
          uuid: receivingUser._id,
          gems: {
            amount: 2,
          },
        };

        await expect(getOneTimePaymentInfo(null, gift, user))
          .to.eventually.be.rejected.and.to.eql({
            httpCode: 401,
            name: 'NotAuthorized',
            message: i18n.t('groupPolicyCannotGetGems'),
          });
      });

      it('throws if the amount of gems is <= 0', async () => {
        const receivingUser = new User();
        await receivingUser.save();
        const gift = {
          type: 'gems',
          uuid: receivingUser._id,
          gems: {
            amount: 0,
          },
        };

        await expect(getOneTimePaymentInfo(null, gift, user))
          .to.eventually.be.rejected.and.to.eql({
            httpCode: 400,
            name: 'BadRequest',
            message: i18n.t('badAmountOfGemsToPurchase'),
          });
      });

      it('throws if the subscription block does not exist', async () => {
        const receivingUser = new User();
        await receivingUser.save();
        const gift = {
          type: 'subscription',
          uuid: receivingUser._id,
          subscription: {
            key: 'invalid',
          },
        };

        await expect(getOneTimePaymentInfo(null, gift, user))
          .to.eventually.throw;
      });

      it('returns the amount (gems)', async () => {
        const receivingUser = new User();
        await receivingUser.save();
        const gift = {
          type: 'gems',
          uuid: receivingUser._id,
          gems: {
            amount: 4,
          },
        };

        expect(subscriptions.checkSubData).to.not.be.called;

        const { gemsBlock, amount, subscription } = await getOneTimePaymentInfo(null, gift, user);
        expect(gemsBlock).to.equal(null);
        expect(amount).to.equal('100');
        expect(subscription).to.be.null;
      });

      it('returns the amount (subscription)', async () => {
        const receivingUser = new User();
        await receivingUser.save();
        const gift = {
          type: 'subscription',
          uuid: receivingUser._id,
          subscription: {
            key: 'basic_3mo',
          },
        };
        const sub = common.content.subscriptionBlocks['basic_3mo']; // eslint-disable-line dot-notation

        const { gemsBlock, amount, subscription } = await getOneTimePaymentInfo(null, gift, user);

        expect(subscriptions.checkSubData).to.be.calledOnce;
        expect(subscriptions.checkSubData).to.be.calledWith(sub, false, null);

        expect(gemsBlock).to.equal(null);
        expect(amount).to.equal('1500');
        expect(Number(amount)).to.equal(sub.price * 100);
        expect(subscription).to.equal(sub);
      });
    });
  });

  describe('applyGemPayment', () => {
    let user;
    let customerId;
    let subKey;
    let userFindByIdStub;
    let paymentsCreateSubSpy;
    let paymentBuyGemsStub;

    beforeEach(async () => {
      subKey = 'basic_3mo';

      user = new User();
      await user.save();

      customerId = 'test-id';

      paymentsCreateSubSpy = sandbox.stub(payments, 'createSubscription');
      paymentsCreateSubSpy.resolves({});

      paymentBuyGemsStub = sandbox.stub(payments, 'buyGems');
      paymentBuyGemsStub.resolves({});
    });

    it('throws if the user does not exist', async () => {
      const metadata = { userId: 'invalid' };
      const session = { metadata, customer: customerId };

      await expect(applyGemPayment(session))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 404,
          name: 'NotFound',
          message: i18n.t('userWithIDNotFound', { userId: metadata.userId }),
        });
    });

    it('throws if the receiving user does not exist', async () => {
      const metadata = { userId: 'invalid' };
      const session = { metadata, customer: customerId };

      await expect(applyGemPayment(session))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 404,
          name: 'NotFound',
          message: i18n.t('userWithIDNotFound', { userId: metadata.userId }),
        });
    });

    it('throws if the gems block does not exist', async () => {
      const gift = {
        type: 'gems',
        uuid: 'invalid',
        gems: {
          amount: 16,
        },
      };

      const metadata = { userId: user._id, gift: JSON.stringify(gift) };
      const session = { metadata, customer: customerId };

      await expect(applyGemPayment(session))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 404,
          name: 'NotFound',
          message: i18n.t('userWithIDNotFound', { userId: 'invalid' }),
        });
    });

    describe('with existing user', () => {
      beforeEach(() => {
        const execStub = sandbox.stub().resolves(user);
        userFindByIdStub = sandbox.stub(User, 'findById');
        userFindByIdStub.withArgs(user._id).returns({ exec: execStub });
      });

      it('buys gems', async () => {
        const metadata = { userId: user._id, gemsBlock: '21gems' };
        const session = { metadata, customer: customerId };

        await applyGemPayment(session);

        expect(paymentBuyGemsStub).to.be.calledOnce;
        expect(paymentBuyGemsStub).to.be.calledWith({
          user,
          customerId,
          paymentMethod: 'Stripe',
          gift: undefined,
          gemsBlock: common.content.gems['21gems'],
        });
      });

      it('gift gems', async () => {
        const receivingUser = new User();
        const execStub = sandbox.stub().resolves(receivingUser);
        userFindByIdStub.withArgs(receivingUser._id).returns({ exec: execStub });
        const gift = {
          type: 'gems',
          uuid: receivingUser._id,
          gems: {
            amount: 16,
          },
        };

        sandbox.stub(JSON, 'parse').returns(gift);
        const metadata = { userId: user._id, gift: JSON.stringify(gift) };
        const session = { metadata, customer: customerId };

        await applyGemPayment(session);

        expect(paymentBuyGemsStub).to.be.calledOnce;
        expect(paymentBuyGemsStub).to.be.calledWith({
          user,
          customerId,
          paymentMethod: 'Gift',
          gift,
          gemsBlock: undefined,
        });
      });

      it('gift sub', async () => {
        const receivingUser = new User();
        const execStub = sandbox.stub().resolves(receivingUser);
        userFindByIdStub.withArgs(receivingUser._id).returns({ exec: execStub });
        const gift = {
          type: 'subscription',
          uuid: receivingUser._id,
          subscription: {
            key: subKey,
          },
        };

        sandbox.stub(JSON, 'parse').returns(gift);
        const metadata = { userId: user._id, gift: JSON.stringify(gift) };
        const session = { metadata, customer: customerId };

        await applyGemPayment(session);

        expect(paymentsCreateSubSpy).to.be.calledOnce;
        expect(paymentsCreateSubSpy).to.be.calledWith({
          user,
          customerId,
          paymentMethod: 'Gift',
          gift,
          gemsBlock: undefined,
        });
      });
    });
  });
});
