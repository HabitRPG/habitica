/* eslint-disable camelcase */
import moment from 'moment';
import payments from '../../../../../website/server/libs/payments/payments';
import googlePayments from '../../../../../website/server/libs/payments/google';
import iap from '../../../../../website/server/libs/inAppPurchases';
import { model as User } from '../../../../../website/server/models/user';
import common from '../../../../../website/common';
import * as gems from '../../../../../website/server/libs/payments/gems';

const { i18n } = common;

describe('Google Payments', () => {
  const subKey = 'basic_3mo';
  let iapSetupStub;
  let iapValidateStub;
  let iapIsValidatedStub;
  let paymentBuySkuStub;
  let validateGiftMessageStub;

  beforeEach(() => {
    iapSetupStub = sinon.stub(iap, 'setup')
      .resolves();
    iapIsValidatedStub = sinon.stub(iap, 'isValidated')
      .returns(true);
    sinon.stub(iap, 'isCanceled').returns(false);
    sinon.stub(iap, 'isExpired').returns(false);
    paymentBuySkuStub = sinon.stub(payments, 'buySkuItem').resolves({});
    validateGiftMessageStub = sinon.stub(gems, 'validateGiftMessage');
  });

  afterEach(() => {
    iap.setup.restore();
    iap.validate.restore();
    iap.isValidated.restore();
    iap.isCanceled.restore();
    iap.isExpired.restore();
    payments.buySkuItem.restore();
    gems.validateGiftMessage.restore();
  });

  describe('verifyPurchase', () => {
    let sku; let user; let token; let receipt; let signature; let
      headers;

    beforeEach(() => {
      sku = 'com.habitrpg.android.habitica.iap.21gems';
      user = new User();
      receipt = `{"token": "${token}", "productId": "${sku}"}`;
      signature = '';
      headers = {};

      iapValidateStub = sinon.stub(iap, 'validate').resolves({ productId: sku });
    });

    it('should throw an error if receipt is invalid', async () => {
      iap.isValidated.restore();
      iapIsValidatedStub = sinon.stub(iap, 'isValidated')
        .returns(false);

      await expect(googlePayments.verifyPurchase({
        user, receipt, signature, headers,
      }))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: googlePayments.constants.RESPONSE_INVALID_RECEIPT,
        });
    });

    it('should throw an error if productId is invalid', async () => {
      receipt = `{"token": "${token}", "productId": "invalid"}`;
      iapValidateStub.restore();
      iapValidateStub = sinon.stub(iap, 'validate').resolves({});

      paymentBuySkuStub.restore();
      await expect(googlePayments.verifyPurchase({
        user, receipt, signature, headers,
      }))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 400,
          name: 'BadRequest',
          message: googlePayments.constants.RESPONSE_INVALID_ITEM,
        });
      paymentBuySkuStub = sinon.stub(payments, 'buySkuItem').resolves({});
    });

    it('should throw an error if user cannot purchase gems', async () => {
      sinon.stub(user, 'canGetGems').resolves(false);

      await expect(googlePayments.verifyPurchase({
        user, receipt, signature, headers,
      }))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: i18n.t('groupPolicyCannotGetGems'),
        });

      user.canGetGems.restore();
    });

    it('purchases gems', async () => {
      sinon.stub(user, 'canGetGems').resolves(true);
      await googlePayments.verifyPurchase({
        user, receipt, signature, headers,
      });

      expect(validateGiftMessageStub).to.not.be.called;

      expect(iapSetupStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledWith(iap.GOOGLE, {
        data: receipt,
        signature,
      });
      expect(iapIsValidatedStub).to.be.calledOnce;
      expect(iapIsValidatedStub).to.be.calledWith(
        { productId: sku },
      );

      expect(paymentBuySkuStub).to.be.calledOnce;
      expect(paymentBuySkuStub).to.be.calledWith({
        user,
        gift: undefined,
        paymentMethod: googlePayments.constants.PAYMENT_METHOD_GOOGLE,
        sku,
        headers,
      });
      expect(user.canGetGems).to.be.calledOnce;
      user.canGetGems.restore();
    });

    it('gifts gems', async () => {
      const receivingUser = new User();
      await receivingUser.save();

      const gift = { uuid: receivingUser._id };
      await googlePayments.verifyPurchase({
        user, gift, receipt, signature, headers,
      });

      expect(validateGiftMessageStub).to.be.calledOnce;
      expect(validateGiftMessageStub).to.be.calledWith(gift, user);

      expect(iapSetupStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledWith(iap.GOOGLE, {
        data: receipt,
        signature,
      });
      expect(iapIsValidatedStub).to.be.calledOnce;
      expect(iapIsValidatedStub).to.be.calledWith(
        { productId: sku },
      );

      expect(paymentBuySkuStub).to.be.calledOnce;
      expect(paymentBuySkuStub).to.be.calledWith({
        user,
        gift: {
          uuid: receivingUser._id,
          member: sinon.match({ _id: receivingUser._id }),
        },
        paymentMethod: googlePayments.constants.PAYMENT_METHOD_GOOGLE,
        sku,
        headers,
      });
    });
  });

  describe('subscribe', () => {
    let sub; let sku; let user; let token; let receipt; let signature; let headers; let
      nextPaymentProcessing;
    let paymentsCreateSubscritionStub;

    beforeEach(() => {
      sub = common.content.subscriptionBlocks[subKey];
      sku = 'com.habitrpg.android.habitica.subscription.3month';

      token = 'test-token';
      headers = {};
      receipt = `{"token": "${token}"}`;
      signature = '';
      nextPaymentProcessing = moment.utc().add({ days: 2 });

      iapValidateStub = sinon.stub(iap, 'validate')
        .resolves({});
      paymentsCreateSubscritionStub = sinon.stub(payments, 'createSubscription').resolves({});
    });

    afterEach(() => {
      payments.createSubscription.restore();
    });

    it('should throw an error if receipt is invalid', async () => {
      iap.isValidated.restore();
      iapIsValidatedStub = sinon.stub(iap, 'isValidated')
        .returns(false);

      await expect(googlePayments
        .subscribe(sku, user, receipt, signature, headers, nextPaymentProcessing))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: googlePayments.constants.RESPONSE_INVALID_RECEIPT,
        });
    });

    it('should throw an error if sku is invalid', async () => {
      sku = 'invalid';

      await expect(googlePayments
        .subscribe(sku, user, receipt, signature, headers, nextPaymentProcessing))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: googlePayments.constants.RESPONSE_INVALID_ITEM,
        });
    });

    it('creates a user subscription', async () => {
      await googlePayments.subscribe(sku, user, receipt, signature, headers, nextPaymentProcessing);

      expect(iapSetupStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledWith(iap.GOOGLE, {
        data: receipt,
        signature,
      });
      expect(iapIsValidatedStub).to.be.calledOnce;
      expect(iapIsValidatedStub).to.be.calledWith({});

      expect(paymentsCreateSubscritionStub).to.be.calledOnce;
      expect(paymentsCreateSubscritionStub).to.be.calledWith({
        user,
        customerId: token,
        paymentMethod: googlePayments.constants.PAYMENT_METHOD_GOOGLE,
        sub,
        headers,
        additionalData: { data: receipt, signature },
        nextPaymentProcessing,
      });
    });
  });

  describe('cancelSubscribe ', () => {
    let user; let token; let receipt; let signature; let headers; let customerId; let
      expirationDate;
    let iapGetPurchaseDataStub; let
      paymentCancelSubscriptionSpy;

    beforeEach(async () => {
      token = 'test-token';
      headers = {};
      receipt = `{"token": "${token}"}`;
      signature = '';
      customerId = 'test-customerId';
      expirationDate = moment.utc();
      iapValidateStub = sinon.stub(iap, 'validate')
        .resolves({
          expirationDate,
        });
      iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
        .returns([{ expirationDate: expirationDate.toDate(), autoRenewing: false }]);

      user = new User();
      user.profile.name = 'sender';
      user.purchased.plan.customerId = customerId;
      user.purchased.plan.paymentMethod = googlePayments.constants.PAYMENT_METHOD_GOOGLE;
      user.purchased.plan.planId = subKey;
      user.purchased.plan.additionalData = { data: receipt, signature };

      paymentCancelSubscriptionSpy = sinon.stub(payments, 'cancelSubscription').resolves({});
    });

    afterEach(() => {
      iap.getPurchaseData.restore();
      payments.cancelSubscription.restore();
    });

    it('should throw an error if we are missing a subscription', async () => {
      user.purchased.plan.paymentMethod = undefined;

      await expect(googlePayments.cancelSubscribe(user, headers))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: i18n.t('missingSubscription'),
        });
    });

    it('should throw an error if receipt is invalid', async () => {
      iap.isValidated.restore();
      iapIsValidatedStub = sinon.stub(iap, 'isValidated')
        .returns(false);

      await expect(googlePayments.cancelSubscribe(user, headers))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: googlePayments.constants.RESPONSE_INVALID_RECEIPT,
        });
    });

    it('should cancel a user subscription', async () => {
      iap.isCanceled.restore();
      iap.isCanceled = sinon.stub(iap, 'isCanceled').returns(true);
      await googlePayments.cancelSubscribe(user, headers);

      expect(iapSetupStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledWith(iap.GOOGLE, {
        data: receipt,
        signature,
      });
      expect(iapIsValidatedStub).to.be.calledOnce;
      expect(iapIsValidatedStub).to.be.calledWith({
        expirationDate,
      });
      expect(iapGetPurchaseDataStub).to.be.calledOnce;

      expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
      expect(paymentCancelSubscriptionSpy).to.be.calledWith({
        user,
        paymentMethod: googlePayments.constants.PAYMENT_METHOD_GOOGLE,
        nextBill: expirationDate.toDate(),
        headers,
      });
    });

    it('should cancel a user subscription with multiple inactive subscriptions', async () => {
      iap.isCanceled.restore();
      iap.isCanceled = sinon.stub(iap, 'isCanceled').returns(true);
      const laterDate = moment.utc().add(7, 'days');
      iap.getPurchaseData.restore();
      iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
        .returns([{
          startTimeMillis: expirationDate.valueOf(),
          expirationDate,
          autoRenewing: false,
        }, {
          startTimeMillis: laterDate.valueOf(),
          expirationDate: laterDate,
          autoRenewing: false,
        },
        ]);
      await googlePayments.cancelSubscribe(user, headers);

      expect(iapSetupStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledWith(iap.GOOGLE, {
        data: receipt,
        signature,
      });
      expect(iapIsValidatedStub).to.be.calledOnce;
      expect(iapIsValidatedStub).to.be.calledWith({
        expirationDate,
      });
      expect(iapGetPurchaseDataStub).to.be.calledOnce;

      expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
      expect(paymentCancelSubscriptionSpy).to.be.calledWith({
        user,
        paymentMethod: googlePayments.constants.PAYMENT_METHOD_GOOGLE,
        nextBill: laterDate.toDate(),
        headers,
      });
    });

    it('should not cancel a user subscription with autorenew', async () => {
      iap.getPurchaseData.restore();
      iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
        .returns([{ autoRenewing: true }]);
      await expect(googlePayments.cancelSubscribe(user, headers))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: googlePayments.constants.RESPONSE_STILL_VALID,
        });

      expect(iapSetupStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledWith(iap.GOOGLE, {
        data: receipt,
        signature,
      });
      expect(iapIsValidatedStub).to.be.calledOnce;
      expect(iapIsValidatedStub).to.be.calledWith({
        expirationDate,
      });
      expect(iapGetPurchaseDataStub).to.be.calledOnce;

      expect(paymentCancelSubscriptionSpy).to.not.be.called;
    });

    it('should not cancel a user subscription with multiple subscriptions with one autorenew', async () => {
      iap.getPurchaseData.restore();
      iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
        .returns([{ expirationDate, autoRenewing: false },
          { autoRenewing: true },
          { expirationDate, autoRenewing: false }]);
      await expect(googlePayments.cancelSubscribe(user, headers))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: googlePayments.constants.RESPONSE_STILL_VALID,
        });
      expect(iapSetupStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledWith(iap.GOOGLE, {
        data: receipt,
        signature,
      });
      expect(iapIsValidatedStub).to.be.calledOnce;
      expect(iapIsValidatedStub).to.be.calledWith({
        expirationDate,
      });
      expect(iapGetPurchaseDataStub).to.be.calledOnce;

      expect(paymentCancelSubscriptionSpy).to.not.be.called;
    });
  });
});
