import moment from 'moment';
import stripeModule from 'stripe';
import cc from 'coupon-code';

import {
  generateGroup,
} from '../../../../helpers/api-unit.helper.js';
import { model as User } from '../../../../../website/server/models/user';
import { model as Coupon } from '../../../../../website/server/models/coupon';
import stripePayments from '../../../../../website/server/libs/stripePayments';
import payments from '../../../../../website/server/libs/payments';
import common from '../../../../../website/common';

const i18n = common.i18n;

describe.only('Stripe Payments', () => {
  let subKey = 'basic_3mo';
  let stripe = stripeModule('test');

  describe('checkout', () => {
    let stripeChargeStub, paymentBuyGemsStub, paymentCreateSubscritionStub;
    let user, group, data, gift, sub, groupId, email, headers, coupon, customerIdResponse, subscriptionId, token;

    beforeEach(() => {
      user = new User();
      user.profile.name = 'sender';
      user.purchased.plan.customerId = 'customer-id';
      user.purchased.plan.planId = subKey;
      user.purchased.plan.lastBillingDate = new Date();

      token = 'test-token';

      customerIdResponse = 'example-customerIdResponse';
      let stripCustomerResponse = {
        id: customerIdResponse,
      };
      stripeChargeStub = sinon.stub(stripe.charges, 'create').returnsPromise().resolves(stripCustomerResponse);
      paymentBuyGemsStub = sinon.stub(payments, 'buyGems').returnsPromise().resolves({});
      paymentCreateSubscritionStub = sinon.stub(payments, 'createSubscription').returnsPromise().resolves({});
    });

    afterEach(() => {
      stripe.charges.create.restore();
      payments.buyGems.restore();
      payments.createSubscription.restore();
    });

    it('should purchase gems', async () => {
      await stripePayments.checkout({
        token,
        user,
        gift,
        groupId,
        email,
        headers,
        coupon,
      }, stripe);

      expect(stripeChargeStub).to.be.calledOnce;
      expect(stripeChargeStub).to.be.calledWith({
        amount: 500,
        currency: 'usd',
        card: token,
      });

      expect(paymentBuyGemsStub).to.be.calledOnce;
      expect(paymentBuyGemsStub).to.be.calledWith({
        user,
        customerId: customerIdResponse,
        paymentMethod: 'Stripe',
        gift,
      });
    });

    it('should gift gems', async () => {
      let receivingUser = new User();
      receivingUser.save();
      let gift = {
        type: 'gems',
        gems: {
          amount: 16,
          uuid: receivingUser._id,
        },
      };
      let amount = 16 / 4;
      await stripePayments.checkout({
        token,
        user,
        gift,
        groupId,
        email,
        headers,
        coupon,
      }, stripe);

      gift.member = receivingUser;
      expect(stripeChargeStub).to.be.calledOnce;
      expect(stripeChargeStub).to.be.calledWith({
        amount: "400",
        currency: 'usd',
        card: token,
      });

      expect(paymentBuyGemsStub).to.be.calledOnce;
      expect(paymentBuyGemsStub).to.be.calledWith({
        user,
        customerId: customerIdResponse,
        paymentMethod: 'Gift',
        gift,
      });
    });

    it('should gift a subscription', async () => {
      let receivingUser = new User();
      receivingUser.save();
      let gift = {
        type: 'subscription',
        subscription: {
          key: subKey,
          uuid: receivingUser._id,
        },
      };
      let amount = common.content.subscriptionBlocks[subKey].price;

      await stripePayments.checkout({
        token,
        user,
        gift,
        groupId,
        email,
        headers,
        coupon,
      }, stripe);

      gift.member = receivingUser;
      expect(stripeChargeStub).to.be.calledOnce;
      expect(stripeChargeStub).to.be.calledWith({
        amount: "1500",
        currency: 'usd',
        card: token,
      });

      expect(paymentCreateSubscritionStub).to.be.calledOnce;
      expect(paymentCreateSubscritionStub).to.be.calledWith({
        user,
        customerId: customerIdResponse,
        paymentMethod: 'Gift',
        gift,
      });
    });
  });

  describe('checkout with subscription', () => {
    let user, group, data, gift, sub, groupId, email, headers, coupon, customerIdResponse, subscriptionId, token;
    let spy;
    let stripeCreateCustomerSpy;
    let stripePaymentsCreateSubSpy;

    beforeEach(async () => {
      user = new User();
      user.profile.name = 'sender';
      user.purchased.plan.customerId = 'customer-id';
      user.purchased.plan.planId = subKey;
      user.purchased.plan.lastBillingDate = new Date();

      group = generateGroup({
        name: 'test group',
        type: 'guild',
        privacy: 'public',
        leader: user._id,
      });
      group.purchased.plan.customerId = 'customer-id';
      group.purchased.plan.planId = subKey;
      await group.save();

      sub = {
        key: 'basic_3mo',
      };

      data = {
        user,
        sub,
        customerId: 'customer-id',
        paymentMethod: 'Payment Method',
      };

      email = 'example@example.com';
      customerIdResponse = 'test-id';
      subscriptionId = 'test-sub-id';
      token = 'test-token';

      spy = sinon.stub(stripe.subscriptions, 'update');
      spy.returnsPromise().resolves;

      stripeCreateCustomerSpy = sinon.stub(stripe.customers, 'create');
      let stripCustomerResponse = {
        id: customerIdResponse,
        subscriptions: {
          data: [{id: subscriptionId}],
        },
      };
      stripeCreateCustomerSpy.returnsPromise().resolves(stripCustomerResponse);

      stripePaymentsCreateSubSpy = sinon.stub(payments, 'createSubscription');
      stripePaymentsCreateSubSpy.returnsPromise().resolves({});

      data.groupId = group._id;
      data.sub.quantity = 3;
    });

    afterEach(function () {
      sinon.restore(stripe.subscriptions.update);
      stripe.customers.create.restore();
      payments.createSubscription.restore();
    });

    it('should throw an error if we are missing a token', async () => {
      await expect(stripePayments.checkout({
        user,
        gift,
        sub,
        groupId,
        email,
        headers,
        coupon,
      }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 400,
        name: 'BadRequest',
        message: 'Missing req.body.id',
      });
    });

    it('should throw an error when coupon code is missing', async () => {
      sub.discount = 40;

      await expect(stripePayments.checkout({
        token,
        user,
        gift,
        sub,
        groupId,
        email,
        headers,
        coupon,
      }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 400,
        name: 'BadRequest',
        message: i18n.t('couponCodeRequired'),
      });
    });

    it('should throw an error when coupon code is invalid', async () => {
      sub.discount = 40;
      sub.key = 'google_6mo';
      coupon = 'example-coupon';

      let couponModel = new Coupon();
      couponModel.event = 'google_6mo';
      await couponModel.save();

      sinon.stub(cc, 'validate').returns('invalid');

      await expect(stripePayments.checkout({
        token,
        user,
        gift,
        sub,
        groupId,
        email,
        headers,
        coupon,
      }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 400,
        name: 'BadRequest',
        message: i18n.t('invalidCoupon'),
      });
      cc.validate.restore();
    });

    it('subscribes with amazon with a coupon', async () => {
      sub.discount = 40;
      sub.key = 'google_6mo';
      coupon = 'example-coupon';

      let couponModel = new Coupon();
      couponModel.event = 'google_6mo';
      let updatedCouponModel = await couponModel.save();

      sinon.stub(cc, 'validate').returns(updatedCouponModel._id);

      await stripePayments.checkout({
        token,
        user,
        gift,
        sub,
        groupId,
        email,
        headers,
        coupon,
      }, stripe);

      expect(stripeCreateCustomerSpy).to.be.calledOnce;
      expect(stripeCreateCustomerSpy).to.be.calledWith({
        email,
        metadata: { uuid: user._id },
        card: token,
        plan: sub.key,
      });

      expect(stripePaymentsCreateSubSpy).to.be.calledOnce;
      expect(stripePaymentsCreateSubSpy).to.be.calledWith({
        user,
        customerId: customerIdResponse,
        paymentMethod: 'Stripe',
        sub,
        headers,
        groupId: undefined,
        subscriptionId: undefined,
      });

      cc.validate.restore();
    });

    it('subscribes a user', async () => {
      let sub = data.sub

      await stripePayments.checkout({
        token,
        user,
        gift,
        sub,
        groupId,
        email,
        headers,
        coupon,
      }, stripe);

      expect(stripeCreateCustomerSpy).to.be.calledOnce;
      expect(stripeCreateCustomerSpy).to.be.calledWith({
        email,
        metadata: { uuid: user._id },
        card: token,
        plan: sub.key,
      });

      expect(stripePaymentsCreateSubSpy).to.be.calledOnce;
      expect(stripePaymentsCreateSubSpy).to.be.calledWith({
        user,
        customerId: customerIdResponse,
        paymentMethod: 'Stripe',
        sub,
        headers,
        groupId: undefined,
        subscriptionId: undefined,
      });
    });

    it('subscribes a group', async () => {
      let token = 'test-token';
      let gift;
      let sub = data.sub;
      let groupId = group._id;
      let email = 'test@test.com';
      let headers = {};
      let coupon;

      await stripePayments.checkout({
        token,
        user,
        gift,
        sub,
        groupId,
        email,
        headers,
        coupon,
      }, stripe);

      expect(stripeCreateCustomerSpy).to.be.calledOnce;
      expect(stripeCreateCustomerSpy).to.be.calledWith({
        email,
        metadata: { uuid: user._id },
        card: token,
        plan: sub.key,
        quantity: 3,
      });

      expect(stripePaymentsCreateSubSpy).to.be.calledOnce;
      expect(stripePaymentsCreateSubSpy).to.be.calledWith({
        user,
        customerId: customerIdResponse,
        paymentMethod: 'Stripe',
        sub,
        headers,
        groupId,
        subscriptionId,
      });
    });
  });

  describe('edit subscription', () => {
    let user, groupId, group, token;

    beforeEach(async () => {
      user = new User();
      user.profile.name = 'sender';
      user.purchased.plan.customerId = 'customer-id';
      user.purchased.plan.planId = subKey;
      user.purchased.plan.lastBillingDate = new Date();

      group = generateGroup({
        name: 'test group',
        type: 'guild',
        privacy: 'public',
        leader: user._id,
      });
      group.purchased.plan.customerId = 'customer-id';
      group.purchased.plan.planId = subKey;
      await group.save();

      groupId = group._id;

      token = 'test-token';
    });

    it('throws an error if there is no customer id', async () => {
      user.purchased.plan.customerId = undefined;

      await expect(stripePayments.editSubscription({
        user,
        groupId,
      }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 401,
        name: 'NotAuthorized',
        message: i18n.t('missingSubscription'),
      });
    });

    it('throws an error if a token is not provided', async () => {
      await expect(stripePayments.editSubscription({
        user,
        groupId,
      }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 400,
        name: 'BadRequest',
        message: 'Missing req.body.id',
      });
    });

    it('throws an error if the group is not found', async () => {
      await expect(stripePayments.editSubscription({
        token,
        user,
        groupId: 'fake-group',
      }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 404,
        name: 'NotFound',
        message: i18n.t('groupNotFound'),
      });
    });

    it('throws an error if user is not the group leader', async () => {
      let nonLeader = new User();
      nonLeader.guilds.push(groupId);
      await nonLeader.save();

      await expect(stripePayments.editSubscription({
        token,
        user: nonLeader,
        groupId,
      }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 401,
        name: 'NotAuthorized',
        message: i18n.t('onlyGroupLeaderCanManageSubscription'),
      });
    });

    describe('success', () => {
      let stripeListSubscriptionStub, stripeUpdateSubscriptionStub, subscriptionId;

      beforeEach(() => {
        subscriptionId = 'subId';
        stripeListSubscriptionStub = sinon.stub(stripe.customers, 'listSubscriptions')
          .returnsPromise().resolves({
            data: [{id: subscriptionId}]
          });

        stripeUpdateSubscriptionStub = sinon.stub(stripe.customers, 'updateSubscription').returnsPromise().resolves({});
      });

      afterEach(() => {
        stripe.customers.listSubscriptions.restore();
        stripe.customers.updateSubscription.restore();
      });

      it('edits a user subscription', async () => {
        await stripePayments.editSubscription({
          token,
          user,
          groupId: undefined,
        }, stripe);

        expect(stripeListSubscriptionStub).to.be.calledOnce;
        expect(stripeListSubscriptionStub).to.be.calledWith(user.purchased.plan.customerId);
        expect(stripeUpdateSubscriptionStub).to.be.calledOnce;
        expect(stripeUpdateSubscriptionStub).to.be.calledWith(
          user.purchased.plan.customerId,
          subscriptionId,
          { card: token }
        );
      });

      it('edits a group subscription', async () => {
        await stripePayments.editSubscription({
          token,
          user,
          groupId,
        }, stripe);

        expect(stripeListSubscriptionStub).to.be.calledOnce;
        expect(stripeListSubscriptionStub).to.be.calledWith(group.purchased.plan.customerId);
        expect(stripeUpdateSubscriptionStub).to.be.calledOnce;
        expect(stripeUpdateSubscriptionStub).to.be.calledWith(
          group.purchased.plan.customerId,
          subscriptionId,
          { card: token }
        );
      });
    });
  });
});
