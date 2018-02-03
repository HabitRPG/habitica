/* eslint-disable camelcase */
import iapModule from '../../../../../website/server/libs/inAppPurchases';
import payments from '../../../../../website/server/libs/payments';
import googlePayments from '../../../../../website/server/libs/googlePayments';
import iap from '../../../../../website/server/libs/inAppPurchases';
import {model as User} from '../../../../../website/server/models/user';
import common from '../../../../../website/common';
import moment from 'moment';

const i18n = common.i18n;

describe('Google Payments', ()  => {
  let subKey = 'basic_3mo';

  describe('verifyGemPurchase', () => {
    let sku, user, token, receipt, signature, headers;
    let iapSetupStub, iapValidateStub, iapIsValidatedStub, paymentBuyGemsStub;

    beforeEach(() => {
      sku = 'com.habitrpg.android.habitica.iap.21gems';
      user = new User();
      receipt = `{"token": "${token}", "productId": "${sku}"}`;
      signature = '';
      headers = {};

      iapSetupStub = sinon.stub(iapModule, 'setup')
        .returnsPromise().resolves();
      iapValidateStub = sinon.stub(iapModule, 'validate')
        .returnsPromise().resolves({});
      iapIsValidatedStub = sinon.stub(iapModule, 'isValidated')
        .returns(true);
      paymentBuyGemsStub = sinon.stub(payments, 'buyGems').returnsPromise().resolves({});
    });

    afterEach(() => {
      iapModule.setup.restore();
      iapModule.validate.restore();
      iapModule.isValidated.restore();
      payments.buyGems.restore();
    });

    it('should throw an error if receipt is invalid', async () => {
      iapModule.isValidated.restore();
      iapIsValidatedStub = sinon.stub(iapModule, 'isValidated')
        .returns(false);

      await expect(googlePayments.verifyGemPurchase(user, receipt, signature, headers))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: googlePayments.constants.RESPONSE_INVALID_RECEIPT,
        });
    });

    it('should throw an error if productId is invalid', async () => {
      receipt = `{"token": "${token}", "productId": "invalid"}`;

      await expect(googlePayments.verifyGemPurchase(user, receipt, signature, headers))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: googlePayments.constants.RESPONSE_INVALID_ITEM,
        });
    });

    it('should throw an error if user cannot purchase gems', async () => {
      sinon.stub(user, 'canGetGems').returnsPromise().resolves(false);

      await expect(googlePayments.verifyGemPurchase(user, receipt, signature, headers))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: i18n.t('groupPolicyCannotGetGems'),
        });

      user.canGetGems.restore();
    });

    it('purchases gems', async () => {
      sinon.stub(user, 'canGetGems').returnsPromise().resolves(true);
      await googlePayments.verifyGemPurchase(user, receipt, signature, headers);

      expect(iapSetupStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledWith(iap.GOOGLE, {
        data: receipt,
        signature,
      });
      expect(iapIsValidatedStub).to.be.calledOnce;
      expect(iapIsValidatedStub).to.be.calledWith({});

      expect(paymentBuyGemsStub).to.be.calledOnce;
      expect(paymentBuyGemsStub).to.be.calledWith({
        user,
        paymentMethod: googlePayments.constants.PAYMENT_METHOD_GOOGLE,
        amount: 5.25,
        headers,
      });
      expect(user.canGetGems).to.be.calledOnce;
      user.canGetGems.restore();
    });
  });

  describe('subscribe', () => {
    let sub, sku, user, token, receipt, signature, headers, nextPaymentProcessing;
    let iapSetupStub, iapValidateStub, iapIsValidatedStub, paymentsCreateSubscritionStub;

    beforeEach(() => {
      sub = common.content.subscriptionBlocks[subKey];
      sku = 'com.habitrpg.android.habitica.subscription.3month';

      token = 'test-token';
      headers = {};
      receipt = `{"token": "${token}"}`;
      signature = '';
      nextPaymentProcessing = moment.utc().add({days: 2});

      iapSetupStub = sinon.stub(iapModule, 'setup')
        .returnsPromise().resolves();
      iapValidateStub = sinon.stub(iapModule, 'validate')
        .returnsPromise().resolves({});
      iapIsValidatedStub = sinon.stub(iapModule, 'isValidated')
        .returns(true);
      paymentsCreateSubscritionStub = sinon.stub(payments, 'createSubscription').returnsPromise().resolves({});
    });

    afterEach(() => {
      iapModule.setup.restore();
      iapModule.validate.restore();
      iapModule.isValidated.restore();
      payments.createSubscription.restore();
    });

    it('should throw an error if receipt is invalid', async () => {
      iapModule.isValidated.restore();
      iapIsValidatedStub = sinon.stub(iapModule, 'isValidated')
        .returns(false);

      await expect(googlePayments.subscribe(sku, user, receipt, signature, headers, nextPaymentProcessing))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: googlePayments.constants.RESPONSE_INVALID_RECEIPT,
        });
    });

    it('should throw an error if sku is invalid', async () => {
      sku = 'invalid';

      await expect(googlePayments.subscribe(sku, user, receipt, signature, headers, nextPaymentProcessing))
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
        additionalData: {data: receipt, signature},
        nextPaymentProcessing,
      });
    });
  });

  describe('cancelSubscribe ', () => {
    let user, token, receipt, signature, headers, customerId, expirationDate;
    let iapSetupStub, iapValidateStub, iapIsValidatedStub, iapGetPurchaseDataStub, paymentCancelSubscriptionSpy;

    beforeEach(async () => {
      token = 'test-token';
      headers = {};
      receipt = `{"token": "${token}"}`;
      signature = '';
      customerId = 'test-customerId';
      expirationDate = moment.utc();

      iapSetupStub = sinon.stub(iapModule, 'setup')
        .returnsPromise().resolves();
      iapValidateStub = sinon.stub(iapModule, 'validate')
        .returnsPromise().resolves({
          expirationDate,
        });
      iapGetPurchaseDataStub = sinon.stub(iapModule, 'getPurchaseData')
        .returns([{expirationDate: expirationDate.toDate()}]);
      iapIsValidatedStub = sinon.stub(iapModule, 'isValidated')
        .returns(true);

      user = new User();
      user.profile.name = 'sender';
      user.purchased.plan.customerId = customerId;
      user.purchased.plan.paymentMethod = googlePayments.constants.PAYMENT_METHOD_GOOGLE;
      user.purchased.plan.planId = subKey;
      user.purchased.plan.additionalData = {data: receipt, signature};

      paymentCancelSubscriptionSpy = sinon.stub(payments, 'cancelSubscription').returnsPromise().resolves({});
    });

    afterEach(function () {
      iapModule.setup.restore();
      iapModule.validate.restore();
      iapModule.isValidated.restore();
      iapModule.getPurchaseData.restore();
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

    it('should throw an error if subscription is still valid', async () => {
      iapModule.getPurchaseData.restore();
      iapGetPurchaseDataStub = sinon.stub(iapModule, 'getPurchaseData')
        .returns([{expirationDate: expirationDate.add({day: 1}).toDate()}]);

      await expect(googlePayments.cancelSubscribe(user, headers))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: googlePayments.constants.RESPONSE_STILL_VALID,
        });
    });

    it('should throw an error if receipt is invalid', async () => {
      iapModule.isValidated.restore();
      iapIsValidatedStub = sinon.stub(iapModule, 'isValidated')
        .returns(false);

      await expect(googlePayments.cancelSubscribe(user, headers))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: googlePayments.constants.RESPONSE_INVALID_RECEIPT,
        });
    });

    it('should cancel a user subscription', async () => {
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
  });
});
