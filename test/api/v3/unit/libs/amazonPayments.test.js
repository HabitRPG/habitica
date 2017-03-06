import moment from 'moment';
import cc from 'coupon-code';
import uuid from 'uuid';

import {
  generateGroup,
} from '../../../../helpers/api-unit.helper.js';
import { model as User } from '../../../../../website/server/models/user';
import { model as Group } from '../../../../../website/server/models/group';
import { model as Coupon } from '../../../../../website/server/models/coupon';
import amzLib from '../../../../../website/server/libs/amazonPayments';
import payments from '../../../../../website/server/libs/payments';
import common from '../../../../../website/common';

const i18n = common.i18n;

describe('Amazon Payments', () => {
  let subKey = 'basic_3mo';

  describe('checkout', () => {
    let user, orderReferenceId, headers;
    let setOrderReferenceDetailsSpy;
    let confirmOrderReferenceSpy;
    let authorizeSpy;
    let closeOrderReferenceSpy;

    let paymentBuyGemsStub;
    let paymentCreateSubscritionStub;
    let amount = 5;

    function expectAmazonStubs () {
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

      sinon.stub(common, 'uuid').returns('uuid-generated');
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
        paymentMethod: amzLib.constants.PAYMENT_METHOD,
        headers,
      });
      expectAmazonStubs();
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
      amount = 16 / 4;
      await amzLib.checkout({gift, user, orderReferenceId, headers});

      gift.member = receivingUser;
      expect(paymentBuyGemsStub).to.be.calledOnce;
      expect(paymentBuyGemsStub).to.be.calledWith({
        user,
        paymentMethod: amzLib.constants.PAYMENT_METHOD_GIFT,
        headers,
        gift,
      });
      expectAmazonStubs();
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
      amount = common.content.subscriptionBlocks[subKey].price;

      await amzLib.checkout({user, orderReferenceId, headers, gift});

      gift.member = receivingUser;
      expect(paymentCreateSubscritionStub).to.be.calledOnce;
      expect(paymentCreateSubscritionStub).to.be.calledWith({
        user,
        paymentMethod: amzLib.constants.PAYMENT_METHOD_GIFT,
        headers,
        gift,
      });
      expectAmazonStubs();
    });
  });

  describe('subscribe', () => {
    let user, group, amount, billingAgreementId, sub, coupon, groupId, headers;
    let amazonSetBillingAgreementDetailsSpy;
    let amazonConfirmBillingAgreementSpy;
    let amazongAuthorizeOnBillingAgreementSpy;
    let createSubSpy;

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

      amount = common.content.subscriptionBlocks[subKey].price;
      billingAgreementId = 'billingAgreementId';
      sub = {
        key: subKey,
        price: amount,
      };
      groupId = group._id;
      headers = {};

      amazonSetBillingAgreementDetailsSpy = sinon.stub(amzLib, 'setBillingAgreementDetails');
      amazonSetBillingAgreementDetailsSpy.returnsPromise().resolves({});

      amazonConfirmBillingAgreementSpy = sinon.stub(amzLib, 'confirmBillingAgreement');
      amazonConfirmBillingAgreementSpy.returnsPromise().resolves({});

      amazongAuthorizeOnBillingAgreementSpy = sinon.stub(amzLib, 'authorizeOnBillingAgreement');
      amazongAuthorizeOnBillingAgreementSpy.returnsPromise().resolves({});

      createSubSpy = sinon.stub(payments, 'createSubscription');
      createSubSpy.returnsPromise().resolves({});

      sinon.stub(common, 'uuid').returns('uuid-generated');
    });

    afterEach(function () {
      amzLib.setBillingAgreementDetails.restore();
      amzLib.confirmBillingAgreement.restore();
      amzLib.authorizeOnBillingAgreement.restore();
      payments.createSubscription.restore();
      common.uuid.restore();
    });

    it('should throw an error if we are missing a subscription', async () => {
      await expect(amzLib.subscribe({
        billingAgreementId,
        coupon,
        user,
        groupId,
        headers,
      }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 400,
        name: 'BadRequest',
        message: i18n.t('missingSubscriptionCode'),
      });
    });

    it('should throw an error if we are missing a billingAgreementId', async () => {
      await expect(amzLib.subscribe({
        sub,
        coupon,
        user,
        groupId,
        headers,
      }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 400,
        name: 'BadRequest',
        message: 'Missing req.body.billingAgreementId',
      });
    });

    it('should throw an error when coupon code is missing', async () => {
      sub.discount = 40;

      await expect(amzLib.subscribe({
        billingAgreementId,
        sub,
        coupon,
        user,
        groupId,
        headers,
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

      await expect(amzLib.subscribe({
        billingAgreementId,
        sub,
        coupon,
        user,
        groupId,
        headers,
      }))
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

      await amzLib.subscribe({
        billingAgreementId,
        sub,
        coupon,
        user,
        groupId,
        headers,
      });

      expect(createSubSpy).to.be.calledOnce;
      expect(createSubSpy).to.be.calledWith({
        user,
        customerId: billingAgreementId,
        paymentMethod: amzLib.constants.PAYMENT_METHOD,
        sub,
        headers,
        groupId,
      });

      cc.validate.restore();
    });

    it('subscribes with amazon', async () => {
      await amzLib.subscribe({
        billingAgreementId,
        sub,
        coupon,
        user,
        groupId,
        headers,
      });

      expect(amazonSetBillingAgreementDetailsSpy).to.be.calledOnce;
      expect(amazonSetBillingAgreementDetailsSpy).to.be.calledWith({
        AmazonBillingAgreementId: billingAgreementId,
        BillingAgreementAttributes: {
          SellerNote: amzLib.constants.SELLER_NOTE_SUBSCRIPTION,
          SellerBillingAgreementAttributes: {
            SellerBillingAgreementId: common.uuid(),
            StoreName: amzLib.constants.STORE_NAME,
            CustomInformation: amzLib.constants.SELLER_NOTE_SUBSCRIPTION,
          },
        },
      });

      expect(amazonConfirmBillingAgreementSpy).to.be.calledOnce;
      expect(amazonConfirmBillingAgreementSpy).to.be.calledWith({
        AmazonBillingAgreementId: billingAgreementId,
      });

      expect(amazongAuthorizeOnBillingAgreementSpy).to.be.calledOnce;
      expect(amazongAuthorizeOnBillingAgreementSpy).to.be.calledWith({
        AmazonBillingAgreementId: billingAgreementId,
        AuthorizationReferenceId: common.uuid().substring(0, 32),
        AuthorizationAmount: {
          CurrencyCode: amzLib.constants.CURRENCY_CODE,
          Amount: amount,
        },
        SellerAuthorizationNote: amzLib.constants.SELLER_NOTE_ATHORIZATION_SUBSCRIPTION,
        TransactionTimeout: 0,
        CaptureNow: true,
        SellerNote: amzLib.constants.SELLER_NOTE_ATHORIZATION_SUBSCRIPTION,
        SellerOrderAttributes: {
          SellerOrderId: common.uuid(),
          StoreName: amzLib.constants.STORE_NAME,
        },
      });

      expect(createSubSpy).to.be.calledOnce;
      expect(createSubSpy).to.be.calledWith({
        user,
        customerId: billingAgreementId,
        paymentMethod: amzLib.constants.PAYMENT_METHOD,
        sub,
        headers,
        groupId,
      });
    });
  });

  describe('cancelSubscription', () => {
    let user, group, headers, billingAgreementId, subscriptionBlock, subscriptionLength;
    let getBillingAgreementDetailsSpy;
    let paymentCancelSubscriptionSpy;

    function expectAmazonStubs () {
      expect(getBillingAgreementDetailsSpy).to.be.calledOnce;
      expect(getBillingAgreementDetailsSpy).to.be.calledWith({
        AmazonBillingAgreementId: billingAgreementId,
      });
    }

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
      group.purchased.plan.lastBillingDate = new Date();
      await group.save();

      subscriptionBlock = common.content.subscriptionBlocks[subKey];
      subscriptionLength = subscriptionBlock.months * 30;

      headers = {};

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
      billingAgreementId = user.purchased.plan.customerId;

      await amzLib.cancelSubscription({user, headers});

      expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
      expect(paymentCancelSubscriptionSpy).to.be.calledWith({
        user,
        groupId: undefined,
        nextBill: moment(user.purchased.plan.lastBillingDate).add({ days: subscriptionLength }),
        paymentMethod: amzLib.constants.PAYMENT_METHOD,
        headers,
      });
      expectAmazonStubs();
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
      billingAgreementId = user.purchased.plan.customerId;

      await amzLib.cancelSubscription({user, headers});

      expectAmazonStubs();
      expect(closeBillingAgreementSpy).to.be.calledOnce;
      expect(closeBillingAgreementSpy).to.be.calledWith({
        AmazonBillingAgreementId: billingAgreementId,
      });
      expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
      expect(paymentCancelSubscriptionSpy).to.be.calledWith({
        user,
        groupId: undefined,
        nextBill: moment(user.purchased.plan.lastBillingDate).add({ days: subscriptionLength }),
        paymentMethod: amzLib.constants.PAYMENT_METHOD,
        headers,
      });
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
      billingAgreementId = group.purchased.plan.customerId;

      await amzLib.cancelSubscription({user, groupId: group._id, headers});

      expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
      expect(paymentCancelSubscriptionSpy).to.be.calledWith({
        user,
        groupId: group._id,
        nextBill: moment(group.purchased.plan.lastBillingDate).add({ days: subscriptionLength }),
        paymentMethod: amzLib.constants.PAYMENT_METHOD,
        headers,
      });
      expectAmazonStubs();
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
      billingAgreementId = group.purchased.plan.customerId;

      await amzLib.cancelSubscription({user, groupId: group._id, headers});

      expectAmazonStubs();
      expect(closeBillingAgreementSpy).to.be.calledOnce;
      expect(closeBillingAgreementSpy).to.be.calledWith({
        AmazonBillingAgreementId: billingAgreementId,
      });
      expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
      expect(paymentCancelSubscriptionSpy).to.be.calledWith({
        user,
        groupId: group._id,
        nextBill: moment(group.purchased.plan.lastBillingDate).add({ days: subscriptionLength }),
        paymentMethod: amzLib.constants.PAYMENT_METHOD,
        headers,
      });
      amzLib.closeBillingAgreement.restore();
    });
  });

  describe('#upgradeGroupPlan', () => {
    let spy, data, user, group, uuidString;

    beforeEach(async function () {
      user = new User();
      user.profile.name = 'sender';

      data = {
        user,
        sub: {
          key: 'basic_3mo', // @TODO: Validate that this is group
        },
        customerId: 'customer-id',
        paymentMethod: 'Payment Method',
        headers: {
          'x-client': 'habitica-web',
          'user-agent': '',
        },
      };

      group = generateGroup({
        name: 'test group',
        type: 'guild',
        privacy: 'public',
        leader: user._id,
      });
      await group.save();

      spy = sinon.stub(amzLib, 'authorizeOnBillingAgreement');
      spy.returnsPromise().resolves([]);

      uuidString = 'uuid-v4';
      sinon.stub(uuid, 'v4').returns(uuidString);

      data.groupId = group._id;
      data.sub.quantity = 3;
    });

    afterEach(function () {
      sinon.restore(amzLib.authorizeOnBillingAgreement);
      uuid.v4.restore();
    });

    it('charges for a new member', async () => {
      data.paymentMethod = amzLib.constants.PAYMENT_METHOD;
      await payments.createSubscription(data);

      let updatedGroup = await Group.findById(group._id).exec();

      updatedGroup.memberCount += 1;
      await updatedGroup.save();

      await amzLib.chargeForAdditionalGroupMember(updatedGroup);

      expect(spy.calledOnce).to.be.true;
      expect(spy).to.be.calledWith({
        AmazonBillingAgreementId: updatedGroup.purchased.plan.customerId,
        AuthorizationReferenceId: uuidString.substring(0, 32),
        AuthorizationAmount: {
          CurrencyCode: amzLib.constants.CURRENCY_CODE,
          Amount: 3,
        },
        SellerAuthorizationNote: amzLib.constants.SELLER_NOTE_GROUP_NEW_MEMBER,
        TransactionTimeout: 0,
        CaptureNow: true,
        SellerNote: amzLib.constants.SELLER_NOTE_GROUP_NEW_MEMBER,
        SellerOrderAttributes: {
          SellerOrderId: uuidString,
          StoreName: amzLib.constants.STORE_NAME,
        },
      });
    });
  });
});
