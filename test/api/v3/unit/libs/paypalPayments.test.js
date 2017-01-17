import nconf from 'nconf';
import moment from 'moment';
import cc from 'coupon-code';

import payments from '../../../../../website/server/libs/payments';
import paypalPayments from '../../../../../website/server/libs/paypalPayments';
import {
  generateGroup,
} from '../../../../helpers/api-unit.helper.js';
import { model as User } from '../../../../../website/server/models/user';
import { model as Coupon } from '../../../../../website/server/models/coupon';
import common from '../../../../../website/common';

const BASE_URL = nconf.get('BASE_URL');
const i18n = common.i18n;

describe('Paypal Payments', ()  => {
  let subKey = 'basic_3mo';

  describe('checkout', () => {
    let paypalPaymentCreateStub;
    let approvalHerf;

    function getPaypalCreateOptions (description, amount) {
      return {
        intent: 'sale',
        payer: { payment_method: 'Paypal' },
        redirect_urls: {
          return_url: `${BASE_URL}/paypal/checkout/success`,
          cancel_url: `${BASE_URL}`,
        },
        transactions: [{
          item_list: {
            items: [{
              name: description,
              price: amount,
              currency: 'USD',
              quantity: 1,
            }],
          },
          amount: {
            currency: 'USD',
            total: amount,
          },
          description,
        }],
      };
    }

    beforeEach(() => {
      approvalHerf = 'approval_href';
      paypalPaymentCreateStub = sinon.stub(paypalPayments, 'paypalPaymentCreate')
        .returnsPromise().resolves({
          links: [{ rel: 'approval_url', href: approvalHerf }],
        });
    });

    afterEach(() => {
      paypalPayments.paypalPaymentCreate.restore();
    });

    it('creates a link for gem purchases', async () => {
      let link = await paypalPayments.checkout();

      expect(paypalPaymentCreateStub).to.be.calledOnce;
      expect(paypalPaymentCreateStub).to.be.calledWith(getPaypalCreateOptions('Habitica Gems', 5.00));
      expect(link).to.eql(approvalHerf);
    });

    it('creates a link for gifting gems', async () => {
      let receivingUser = new User();
      let gift = {
        type: 'gems',
        gems: {
          amount: 16,
          uuid: receivingUser._id,
        },
      };

      let link = await paypalPayments.checkout({gift});

      expect(paypalPaymentCreateStub).to.be.calledOnce;
      expect(paypalPaymentCreateStub).to.be.calledWith(getPaypalCreateOptions('Habitica Gems (Gift)', "4.00"));
      expect(link).to.eql(approvalHerf);
    });

    it('creates a link for gifting a subscription', async () => {
      let receivingUser = new User();
      receivingUser.save();
      let gift = {
        type: 'subscription',
        subscription: {
          key: subKey,
          uuid: receivingUser._id,
        },
      };

      let link = await paypalPayments.checkout({gift});

      expect(paypalPaymentCreateStub).to.be.calledOnce;
      expect(paypalPaymentCreateStub).to.be.calledWith(getPaypalCreateOptions('mo. Habitica Subscription (Gift)', "15.00"));
      expect(link).to.eql(approvalHerf);
    });
  });

  describe('checkout success', () => {
    let user, gift, customerId, paymentId;
    let paypalPaymentExecuteStub, paymentBuyGemsStub, paymentsCreateSubscritionStub;

    beforeEach(() => {
      user = new User();
      customerId = 'customerId-test';
      paymentId = 'paymentId-test';

      paypalPaymentExecuteStub = sinon.stub(paypalPayments, 'paypalPaymentExecute').returnsPromise().resolves({});
      paymentBuyGemsStub = sinon.stub(payments, 'buyGems').returnsPromise().resolves({});
      paymentsCreateSubscritionStub = sinon.stub(payments, 'createSubscription').returnsPromise().resolves({});
    });

    afterEach(() => {
      paypalPayments.paypalPaymentExecute.restore();
      payments.buyGems.restore();
      payments.createSubscription.restore();
    });

    it('purchases gems', async () => {
      await paypalPayments.checkoutSuccess({user, gift, paymentId, customerId});

      expect(paypalPaymentExecuteStub).to.be.calledOnce;
      expect(paypalPaymentExecuteStub).to.be.calledWith(paymentId, { payer_id: customerId });
      expect(paymentBuyGemsStub).to.be.calledOnce;
      expect(paymentBuyGemsStub).to.be.calledWith({
        user,
        customerId,
        paymentMethod: 'Paypal',
      });
    });

    it('gifts gems', async () => {
      let receivingUser = new User();
      await receivingUser.save();
      let gift = {
        type: 'gems',
        gems: {
          amount: 16,
          uuid: receivingUser._id,
        },
      };

      await paypalPayments.checkoutSuccess({user, gift, paymentId, customerId});

      expect(paypalPaymentExecuteStub).to.be.calledOnce;
      expect(paypalPaymentExecuteStub).to.be.calledWith(paymentId, { payer_id: customerId });
      expect(paymentBuyGemsStub).to.be.calledOnce;
      expect(paymentBuyGemsStub).to.be.calledWith({
        user,
        customerId,
        paymentMethod: 'PayPal (Gift)',
        gift,
      });
    });

    it('gifts subscription', async () => {
      let receivingUser = new User();
      await receivingUser.save();
      let gift = {
        type: 'subscription',
        subscription: {
          key: subKey,
          uuid: receivingUser._id,
        },
      };

      await paypalPayments.checkoutSuccess({user, gift, paymentId, customerId});

      expect(paypalPaymentExecuteStub).to.be.calledOnce;
      expect(paypalPaymentExecuteStub).to.be.calledWith(paymentId, { payer_id: customerId });
      expect(paymentsCreateSubscritionStub).to.be.calledOnce;
      expect(paymentsCreateSubscritionStub).to.be.calledWith({
        user,
        customerId,
        paymentMethod: 'PayPal (Gift)',
        gift,
      });
    });
  });

  describe('subscribe', () => {
    let coupon, sub, approvalHerf;
    let paypalBillingAgreementCreateStub;

    beforeEach(() => {
      approvalHerf = 'approvalHerf-test';
      sub = common.content.subscriptionBlocks[subKey];

      paypalBillingAgreementCreateStub = sinon.stub(paypalPayments, 'paypalBillingAgreementCreate')
        .returnsPromise().resolves({
          links: [{ rel: 'approval_url', href: approvalHerf }],
        });
    });

    afterEach(() => {
      paypalPayments.paypalBillingAgreementCreate.restore();
    });

    it('should throw an error when coupon code is missing', async () => {
      sub.discount = 40;

      await expect(paypalPayments.subscribe({sub, coupon}))
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

      await expect(paypalPayments.subscribe({sub, coupon}))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
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

      let link = await paypalPayments.subscribe({sub, coupon});

      expect(link).to.eql(approvalHerf);
      expect(paypalBillingAgreementCreateStub).to.be.calledOnce;
      let billingPlanTitle = `Habitica Subscription ($${sub.price} every ${sub.months} months, recurring)`;
      expect(paypalBillingAgreementCreateStub).to.be.calledWith({
        name: billingPlanTitle,
        description: billingPlanTitle,
        start_date: moment().add({ minutes: 5 }).format(),
        plan: {
          id: sub.paypalKey,
        },
        payer: {
          payment_method: 'Paypal',
        },
      });

      cc.validate.restore();
    });

    it('creates a link for a subscription', async () => {
      delete sub.discount;

      let link = await paypalPayments.subscribe({sub, coupon});

      expect(link).to.eql(approvalHerf);
      expect(paypalBillingAgreementCreateStub).to.be.calledOnce;
      let billingPlanTitle = `Habitica Subscription ($${sub.price} every ${sub.months} months, recurring)`;
      expect(paypalBillingAgreementCreateStub).to.be.calledWith({
        name: billingPlanTitle,
        description: billingPlanTitle,
        start_date: moment().add({ minutes: 5 }).format(),
        plan: {
          id: sub.paypalKey,
        },
        payer: {
          payment_method: 'Paypal',
        },
      });
    });
  });

  describe('subscribeSuccess', () => {
    let user, group, block, groupId, token, headers, customerId;
    let paypalBillingAgreementExecuteStub, paymentsCreateSubscritionStub;

    beforeEach(async () => {
      user = new User();

      group = generateGroup({
        name: 'test group',
        type: 'guild',
        privacy: 'public',
        leader: user._id,
      });

      token = 'test-token';
      headers = {};
      block = common.content.subscriptionBlocks[subKey];
      customerId = 'test-customerId';

      paypalBillingAgreementExecuteStub = sinon.stub(paypalPayments, 'paypalBillingAgreementExecute')
        .returnsPromise({}).resolves({
          id: customerId,
        });
      paymentsCreateSubscritionStub = sinon.stub(payments, 'createSubscription').returnsPromise().resolves({});
    });

    afterEach(() => {
      paypalPayments.paypalBillingAgreementExecute.restore();
      payments.createSubscription.restore();
    });

    it('creates a user subscription', async () => {
      await paypalPayments.subscribeSuccess({user, block, groupId, token, headers});

      expect(paypalBillingAgreementExecuteStub).to.be.calledOnce;
      expect(paypalBillingAgreementExecuteStub).to.be.calledWith(token, {});

      expect(paymentsCreateSubscritionStub).to.be.calledOnce;
      expect(paymentsCreateSubscritionStub).to.be.calledWith({
        user,
        groupId,
        customerId,
        paymentMethod: 'Paypal',
        sub: block,
        headers,
      });
    });

    it('create a group subscription', async () => {
      groupId = group._id;

      await paypalPayments.subscribeSuccess({user, block, groupId, token, headers});

      expect(paypalBillingAgreementExecuteStub).to.be.calledOnce;
      expect(paypalBillingAgreementExecuteStub).to.be.calledWith(token, {});

      expect(paymentsCreateSubscritionStub).to.be.calledOnce;
      expect(paymentsCreateSubscritionStub).to.be.calledWith({
        user,
        groupId,
        customerId,
        paymentMethod: 'Paypal',
        sub: block,
        headers,
      });
    });
  });

  describe('subscribeCancel', () => {
    let user, group, groupId, headers, customerId, groupCustomerId, subscriptionBlock, subscriptionLength, nextBillingDate;
    let paymentCancelSubscriptionSpy, paypalBillingAgreementCancelStub, paypalBillingAgreementGetStub;

    beforeEach(async () => {
      customerId = 'customer-id';
      groupCustomerId = 'groupCustomerId-test';

      user = new User();
      user.profile.name = 'sender';
      user.purchased.plan.customerId = customerId;
      user.purchased.plan.planId = subKey;
      user.purchased.plan.lastBillingDate = new Date();

      group = generateGroup({
        name: 'test group',
        type: 'guild',
        privacy: 'public',
        leader: user._id,
      });
      group.purchased.plan.customerId = groupCustomerId;
      group.purchased.plan.planId = subKey;
      group.purchased.plan.lastBillingDate = new Date();
      await group.save();

      subscriptionBlock = common.content.subscriptionBlocks[subKey];
      subscriptionLength = subscriptionBlock.months * 30;
      headers = {};
      nextBillingDate = new Date();

      paypalBillingAgreementCancelStub = sinon.stub(paypalPayments, 'paypalBillingAgreementCancel').returnsPromise().resolves({});
      paypalBillingAgreementGetStub = sinon.stub(paypalPayments, 'paypalBillingAgreementGet')
        .returnsPromise().resolves({
          'agreement_details': {
            'next_billing_date': nextBillingDate,
            'cycles_completed': 1,
          },
        });
      paymentCancelSubscriptionSpy = sinon.stub(payments, 'cancelSubscription').returnsPromise().resolves({});
    });

    afterEach(function () {
      paypalPayments.paypalBillingAgreementGet.restore();
      paypalPayments.paypalBillingAgreementCancel.restore();
      payments.cancelSubscription.restore();
    });

    it('should throw an error if we are missing a subscription', async () => {
      user.purchased.plan.customerId = undefined;

      await expect(paypalPayments.subscribeCancel({user}))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: i18n.t('missingSubscription'),
        });
    });

    it('should throw an error if group is not found', async () => {
      await expect(paypalPayments.subscribeCancel({user, groupId: 'fake-id'}))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 404,
          name: 'NotFound',
          message: i18n.t('groupNotFound'),
        });
    });

    it('should throw an error if user is not group leader', async () => {
      let nonLeader = new User();
      nonLeader.guilds.push(group._id);
      await nonLeader.save();

      await expect(paypalPayments.subscribeCancel({user: nonLeader, groupId: group._id}))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: i18n.t('onlyGroupLeaderCanManageSubscription'),
        });
    });

    it('should cancel a user subscription', async () => {
      await paypalPayments.subscribeCancel({user});

      expect(paypalBillingAgreementGetStub).to.be.calledOnce;
      expect(paypalBillingAgreementGetStub).to.be.calledWith(customerId);
      expect(paypalBillingAgreementCancelStub).to.be.calledOnce;
      expect(paypalBillingAgreementCancelStub).to.be.calledWith(customerId, { note: i18n.t('cancelingSubscription') });

      expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
      expect(paymentCancelSubscriptionSpy).to.be.calledWith({
        user,
        groupId,
        paymentMethod: 'Paypal',
        nextBill: nextBillingDate,
      });
    });

    it('should cancel a group subscription', async () => {
      await paypalPayments.subscribeCancel({user, groupId: group._id});

      expect(paypalBillingAgreementGetStub).to.be.calledOnce;
      expect(paypalBillingAgreementGetStub).to.be.calledWith(groupCustomerId);
      expect(paypalBillingAgreementCancelStub).to.be.calledOnce;
      expect(paypalBillingAgreementCancelStub).to.be.calledWith(groupCustomerId, { note: i18n.t('cancelingSubscription') });

      expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
      expect(paymentCancelSubscriptionSpy).to.be.calledWith({
        user,
        groupId: group._id,
        paymentMethod: 'Paypal',
        nextBill: nextBillingDate,
      });
    });
  });

  describe('ipn', () => {
    let user, group, txn_type, userPaymentId, groupPaymentId;
    let ipnVerifyAsyncStub, paymentCancelSubscriptionSpy;

    beforeEach(async () => {
      txn_type = 'recurring_payment_profile_cancel';
      userPaymentId = 'userPaymentId-test';
      groupPaymentId = 'groupPaymentId-test';

      user = new User();
      user.profile.name = 'sender';
      user.purchased.plan.customerId = userPaymentId;
      user.purchased.plan.planId = subKey;
      user.purchased.plan.lastBillingDate = new Date();
      await user.save();

      group = generateGroup({
        name: 'test group',
        type: 'guild',
        privacy: 'public',
        leader: user._id,
      });
      group.purchased.plan.customerId = groupPaymentId;
      group.purchased.plan.planId = subKey;
      group.purchased.plan.lastBillingDate = new Date();
      await group.save();

      ipnVerifyAsyncStub = sinon.stub(paypalPayments, 'ipnVerifyAsync').returnsPromise().resolves({});
      paymentCancelSubscriptionSpy = sinon.stub(payments, 'cancelSubscription').returnsPromise().resolves({});
    });

    afterEach(function () {
      paypalPayments.ipnVerifyAsync.restore();
      payments.cancelSubscription.restore();
    });

    it('should cancel a user subscription', async () => {
      await paypalPayments.ipn({txn_type, recurring_payment_id: userPaymentId});

      expect(ipnVerifyAsyncStub).to.be.calledOnce;
      expect(ipnVerifyAsyncStub).to.be.calledWith({txn_type, recurring_payment_id: userPaymentId});

      expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
      expect(paymentCancelSubscriptionSpy.args[0][0].user._id).to.eql(user._id);
      expect(paymentCancelSubscriptionSpy.args[0][0].paymentMethod).to.eql('Paypal');
    });

    it('should cancel a group subscription', async () => {
      await paypalPayments.ipn({txn_type, recurring_payment_id: groupPaymentId});

      expect(ipnVerifyAsyncStub).to.be.calledOnce;
      expect(ipnVerifyAsyncStub).to.be.calledWith({txn_type, recurring_payment_id: groupPaymentId});

      expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
      expect(paymentCancelSubscriptionSpy).to.be.calledWith({ groupId: group._id, paymentMethod: 'Paypal' });
    });
  });
});
