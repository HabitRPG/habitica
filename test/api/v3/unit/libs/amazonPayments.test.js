import nconf from 'nconf';

import {
  generateGroup,
} from '../../../../helpers/api-unit.helper.js';
import { model as User } from '../../../../../website/server/models/user';
import { model as Group } from '../../../../../website/server/models/group';
import amzLib from '../../../../../website/server/libs/amazonPayments';
import payments from '../../../../../website/server/libs/payments';
import common from '../../../../../website/common';

const i18n = common.i18n;

describe('Amazon Payments', () => {
  describe('checkout', () => {
    let user, orderReferenceId, headers;
    let setOrderReferenceDetailsSpy;
    let confirmOrderReferenceSpy;
    let authorizeSpy;
    let closeOrderReferenceSpy;

    let paymentBuyGemsStub;
    let paymentCreateSubscritionStub;
    let commonUUIDStub;
    let amount = 5;

    function expectAmazonStubs(options = {}) {
      let {orderReferenceId, amount} = options;

      expect(setOrderReferenceDetailsSpy).to.be.calledOnce;
      expect(setOrderReferenceDetailsSpy).to.be.calledWith({
        AmazonOrderReferenceId: orderReferenceId,
        OrderReferenceAttributes: {
          OrderTotal: {
            CurrencyCode: amzLib.constants.CURRENCY_CODE,
            Amount: amount,
          },
          SellerNote: amzLib.constants.SELLER_NOTE,
          SellerOrderAttributes: {
            SellerOrderId: common.uuid(),
            StoreName: amzLib.constants.STORE_NAME,
          },
        },
      });

      expect(confirmOrderReferenceSpy).to.be.calledOnce;
      expect(confirmOrderReferenceSpy).to.be.calledWith({ AmazonOrderReferenceId: orderReferenceId });

      expect(authorizeSpy).to.be.calledOnce;
      expect(authorizeSpy).to.be.calledWith({
        AmazonOrderReferenceId: orderReferenceId,
        AuthorizationReferenceId: common.uuid().substring(0, 32),
        AuthorizationAmount: {
          CurrencyCode: amzLib.constants.CURRENCY_CODE,
          Amount: amount,
        },
        SellerAuthorizationNote: amzLib.constants.SELLER_NOTE,
        TransactionTimeout: 0,
        CaptureNow: true,
      });

      expect(closeOrderReferenceSpy).to.be.calledOnce;
      expect(closeOrderReferenceSpy).to.be.calledWith({ AmazonOrderReferenceId: orderReferenceId });
    }

    beforeEach(function () {
      user = new User();
      headers = {};
      orderReferenceId = 'orderReferenceId';

      setOrderReferenceDetailsSpy = sinon.stub(amzLib, 'setOrderReferenceDetails');
      setOrderReferenceDetailsSpy.returnsPromise().resolves({});

      confirmOrderReferenceSpy = sinon.stub(amzLib, 'confirmOrderReference');
      confirmOrderReferenceSpy.returnsPromise().resolves({});

      authorizeSpy = sinon.stub(amzLib, 'authorize');
      authorizeSpy.returnsPromise().resolves({});

      closeOrderReferenceSpy = sinon.stub(amzLib, 'closeOrderReference');
      closeOrderReferenceSpy.returnsPromise().resolves({});

      paymentBuyGemsStub = sinon.stub(payments, 'buyGems');
      paymentBuyGemsStub.returnsPromise().resolves({});

      paymentCreateSubscritionStub = sinon.stub(payments, 'createSubscription');
      paymentCreateSubscritionStub.returnsPromise().resolves({});

      commonUUIDStub = sinon.stub(common, 'uuid').returns('uuid-generated');
    });

    afterEach(function () {
      amzLib.setOrderReferenceDetails.restore();
      amzLib.confirmOrderReference.restore();
      amzLib.authorize.restore();
      amzLib.closeOrderReference.restore();
      payments.buyGems.restore();
      payments.createSubscription.restore();
      common.uuid.restore();
    });

    it('should purchase gems', async () => {
      await amzLib.checkout({user, orderReferenceId, headers});

      expect(paymentBuyGemsStub).to.be.calledOnce;
      expect(paymentBuyGemsStub).to.be.calledWith({
        user,
        paymentMethod: amzLib.constants.PAYMENT_METHOD_AMAZON,
        headers,
      });
      expectAmazonStubs({orderReferenceId, amount});
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
      await amzLib.checkout({gift, user, orderReferenceId, headers});

      gift.member = receivingUser;
      expect(paymentBuyGemsStub).to.be.calledOnce;
      expect(paymentBuyGemsStub).to.be.calledWith({
        user,
        paymentMethod: amzLib.constants.PAYMENT_METHOD_AMAZON_GIFT,
        headers,
        gift,
      });
      expectAmazonStubs({orderReferenceId, amount});
    });

    it('should gift a subscription', async () => {
      let receivingUser = new User();
      receivingUser.save();
      let gift = {
        type: 'subscription',
        subscription: {
          key: 'basic_3mo',
          uuid: receivingUser._id,
        },
      };
      let amount = common.content.subscriptionBlocks['basic_3mo'].price;

      await amzLib.checkout({user, orderReferenceId, headers, gift});

      gift.member = receivingUser;
      expect(paymentCreateSubscritionStub).to.be.calledOnce;
      expect(paymentCreateSubscritionStub).to.be.calledWith({
        user,
        paymentMethod: amzLib.constants.PAYMENT_METHOD_AMAZON_GIFT,
        headers,
        gift,
      });
      expectAmazonStubs({orderReferenceId, amount});
    });
  });

  describe('subscribed', () => {
    let user, group;
    let amazonSetBillingAgreementDetailsSpy;
    let amazonConfirmBillingAgreementSpy;
    let amazongAuthorizeOnBillingAgreementSpy;
    let createSubSpy;

    beforeEach(async () => {
      user = new User();
      user.profile.name = 'sender';
      user.purchased.plan.customerId = 'customer-id';
      user.purchased.plan.planId = 'basic_3mo';
      user.purchased.plan.lastBillingDate = new Date();

      group = generateGroup({
        name: 'test group',
        type: 'guild',
        privacy: 'public',
        leader: user._id,
      });
      group.purchased.plan.customerId = 'customer-id';
      group.purchased.plan.planId = 'basic_3mo';
      await group.save();

      amazonSetBillingAgreementDetailsSpy = sinon.stub(amzLib, 'setBillingAgreementDetails');
      amazonSetBillingAgreementDetailsSpy.returnsPromise().resolves({});

      amazonConfirmBillingAgreementSpy = sinon.stub(amzLib, 'confirmBillingAgreement');
      amazonConfirmBillingAgreementSpy.returnsPromise().resolves({});

      amazongAuthorizeOnBillingAgreementSpy = sinon.stub(amzLib, 'authorizeOnBillingAgreement');
      amazongAuthorizeOnBillingAgreementSpy.returnsPromise().resolves({});

      createSubSpy = sinon.stub(payments, 'createSubscription');
      createSubSpy.returnsPromise().resolves({});
    });

    afterEach(function () {
      amzLib.setBillingAgreementDetails.restore();
      amzLib.confirmBillingAgreement.restore();
      amzLib.authorizeOnBillingAgreement.restore();
      payments.createSubscription.restore();
    });

    it('subscribes with amazon', async () => {
      let billingAgreementId = 'billingAgreementId';
      let sub = {
        key: 'basic_3mo',
      };
      let coupon;
      let groupId = group._id;
      let headers = {};

      await amzLib.subscribe({
        billingAgreementId,
        sub,
        coupon,
        user,
        groupId,
        headers,
      });

      expect(amazonSetBillingAgreementDetailsSpy.calledOnce).to.be.true;
      expect(amazonConfirmBillingAgreementSpy.calledOnce).to.be.true;
      expect(amazongAuthorizeOnBillingAgreementSpy.calledOnce).to.be.true;
      expect(createSubSpy.calledOnce).to.be.true;
    });
  });

  describe('cancelSubscription', () => {
    let user, group;
    let getBillingAgreementDetailsSpy;
    let paymentCancelSubscriptionSpy;

    beforeEach(async () => {
      user = new User();
      user.profile.name = 'sender';
      user.purchased.plan.customerId = 'customer-id';
      user.purchased.plan.planId = 'basic_3mo';
      user.purchased.plan.lastBillingDate = new Date();

      group = generateGroup({
        name: 'test group',
        type: 'guild',
        privacy: 'public',
        leader: user._id,
      });
      group.purchased.plan.customerId = 'customer-id';
      group.purchased.plan.planId = 'basic_3mo';
      await group.save();

      getBillingAgreementDetailsSpy = sinon.stub(amzLib, 'getBillingAgreementDetails');
      getBillingAgreementDetailsSpy.returnsPromise().resolves({
        BillingAgreementDetails: {
          BillingAgreementStatus: {State: 'Closed'},
        },
      });

      paymentCancelSubscriptionSpy = sinon.stub(payments, 'cancelSubscription');
      paymentCancelSubscriptionSpy.returnsPromise().resolves({});
    });

    afterEach(function () {
      amzLib.getBillingAgreementDetails.restore();
      payments.cancelSubscription.restore();
    });

    it('should throw an error if we are missing a subscription', async () => {
      user.purchased.plan.customerId = undefined;

      await expect(amzLib.cancelSubscription({user}))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: i18n.t('missingSubscription'),
        });
    });

    it('should cancel a user subscription', async () => {
      await amzLib.cancelSubscription({user});

      expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
    });

    it('should close a user subscription if amazon not closed', async () => {
      amzLib.getBillingAgreementDetails.restore();
      getBillingAgreementDetailsSpy = sinon.stub(amzLib, 'getBillingAgreementDetails')
        .returnsPromise()
        .resolves({
          BillingAgreementDetails: {
            BillingAgreementStatus: {State: 'Open'},
          },
        });
      let closeBillingAgreementSpy = sinon.stub(amzLib, 'closeBillingAgreement').returnsPromise().resolves({});

      await amzLib.cancelSubscription({user});

      expect(getBillingAgreementDetailsSpy).to.be.calledOnce;
      expect(closeBillingAgreementSpy).to.be.calledOnce;
      expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
      amzLib.closeBillingAgreement.restore();
    });

    it('should throw an error if group is not found', async () => {
      await expect(amzLib.cancelSubscription({user, groupId: 'fake-id'}))
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

      await expect(amzLib.cancelSubscription({user: nonLeader, groupId: group._id}))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: i18n.t('onlyGroupLeaderCanManageSubscription'),
        });
    });

    it('should cancel a group subscription', async () => {
      await amzLib.cancelSubscription({user, groupId: group._id});

      expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
    });

    it('should close a group subscription if amazon not closed', async () => {
      amzLib.getBillingAgreementDetails.restore();
      getBillingAgreementDetailsSpy = sinon.stub(amzLib, 'getBillingAgreementDetails')
        .returnsPromise()
        .resolves({
          BillingAgreementDetails: {
            BillingAgreementStatus: {State: 'Open'},
          },
        });
      let closeBillingAgreementSpy = sinon.stub(amzLib, 'closeBillingAgreement').returnsPromise().resolves({});

      await amzLib.cancelSubscription({user, groupId: group._id});

      expect(getBillingAgreementDetailsSpy).to.be.calledOnce;
      expect(closeBillingAgreementSpy).to.be.calledOnce;
      expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
      amzLib.closeBillingAgreement.restore();
    });
  });
});
