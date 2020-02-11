/* eslint-disable camelcase */
import moment from 'moment';
import payments from '../../../../../website/server/libs/payments/payments';
import googlePayments from '../../../../../website/server/libs/payments/google';
import iap from '../../../../../website/server/libs/inAppPurchases';
import { model as User } from '../../../../../website/server/models/user';
import common from '../../../../../website/common';
import { mockFindById, restoreFindById } from '../../../../helpers/mongoose.helper';

const { i18n } = common;

describe('Google Payments', () => {
  const subKey = 'basic_3mo';

  describe('verifyGemPurchase', () => {
    let sku; let user; let token; let receipt; let signature; let
      headers;
    let iapSetupStub; let iapValidateStub; let iapIsValidatedStub; let
      paymentBuyGemsStub;

    beforeEach(() => {
      sku = 'com.habitrpg.android.habitica.iap.21gems';
      user = new User();
      receipt = `{"token": "${token}", "productId": "${sku}"}`;
      signature = '';
      headers = {};

      iapSetupStub = sinon.stub(iap, 'setup')
        .resolves();
      iapValidateStub = sinon.stub(iap, 'validate')
        .resolves({});
      iapIsValidatedStub = sinon.stub(iap, 'isValidated')
        .returns(true);
      paymentBuyGemsStub = sinon.stub(payments, 'buyGems').resolves({});
    });

    afterEach(() => {
      iap.setup.restore();
      iap.validate.restore();
      iap.isValidated.restore();
      payments.buyGems.restore();
    });

    it('should throw an error if receipt is invalid', async () => {
      iap.isValidated.restore();
      iapIsValidatedStub = sinon.stub(iap, 'isValidated')
        .returns(false);

      await expect(googlePayments.verifyGemPurchase({
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

      await expect(googlePayments.verifyGemPurchase({
        user, receipt, signature, headers,
      }))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: googlePayments.constants.RESPONSE_INVALID_ITEM,
        });
    });

    it('should throw an error if user cannot purchase gems', async () => {
      sinon.stub(user, 'canGetGems').resolves(false);

      await expect(googlePayments.verifyGemPurchase({
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
      await googlePayments.verifyGemPurchase({
        user, receipt, signature, headers,
      });

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

    it('gifts gems', async () => {
      const receivingUser = new User();
      await receivingUser.save();

      mockFindById(receivingUser);

      const gift = { uuid: receivingUser._id };
      await googlePayments.verifyGemPurchase({
        user, gift, receipt, signature, headers,
      });

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
        user: receivingUser,
        paymentMethod: googlePayments.constants.PAYMENT_METHOD_GOOGLE,
        amount: 5.25,
        headers,
      });
      restoreFindById();
    });
  });

  describe('subscribe', () => {
    let sub; let sku; let user; let token; let receipt; let signature; let headers; let
      nextPaymentProcessing;
    let iapSetupStub; let iapValidateStub; let iapIsValidatedStub; let
      paymentsCreateSubscritionStub;

    beforeEach(() => {
      sub = common.content.subscriptionBlocks[subKey];
      sku = 'com.habitrpg.android.habitica.subscription.3month';

      token = 'test-token';
      headers = {};
      receipt = `{"token": "${token}"}`;
      signature = '';
      nextPaymentProcessing = moment.utc().add({ days: 2 });

      iapSetupStub = sinon.stub(iap, 'setup')
        .resolves();
      iapValidateStub = sinon.stub(iap, 'validate')
        .resolves({});
      iapIsValidatedStub = sinon.stub(iap, 'isValidated')
        .returns(true);
      paymentsCreateSubscritionStub = sinon.stub(payments, 'createSubscription').resolves({});
    });

    afterEach(() => {
      iap.setup.restore();
      iap.validate.restore();
      iap.isValidated.restore();
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
    let iapSetupStub; let iapValidateStub; let iapIsValidatedStub; let iapGetPurchaseDataStub; let
      paymentCancelSubscriptionSpy;

    beforeEach(async () => {
      token = 'test-token';
      headers = {};
      receipt = `{"token": "${token}"}`;
      signature = '';
      customerId = 'test-customerId';
      expirationDate = moment.utc();

      iapSetupStub = sinon.stub(iap, 'setup')
        .resolves();
      iapValidateStub = sinon.stub(iap, 'validate')
        .resolves({
          expirationDate,
        });
      iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
        .returns([{ expirationDate: expirationDate.toDate() }]);
      iapIsValidatedStub = sinon.stub(iap, 'isValidated')
        .returns(true);

      user = new User();
      user.profile.name = 'sender';
      user.purchased.plan.customerId = customerId;
      user.purchased.plan.paymentMethod = googlePayments.constants.PAYMENT_METHOD_GOOGLE;
      user.purchased.plan.planId = subKey;
      user.purchased.plan.additionalData = { data: receipt, signature };

      paymentCancelSubscriptionSpy = sinon.stub(payments, 'cancelSubscription').resolves({});
    });

    afterEach(() => {
      iap.setup.restore();
      iap.validate.restore();
      iap.isValidated.restore();
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
