/* eslint-disable camelcase */
import moment from 'moment';
import payments from '../../../../../website/server/libs/payments/payments';
import applePayments from '../../../../../website/server/libs/payments/apple';
import iap from '../../../../../website/server/libs/inAppPurchases';
import { model as User } from '../../../../../website/server/models/user';
import common from '../../../../../website/common';
import * as gems from '../../../../../website/server/libs/payments/gems';

const { i18n } = common;

describe('Apple Payments', () => {
  const subKey = 'basic_3mo';

  describe('verifyPurchase', () => {
    let sku; let user; let token; let receipt; let
      headers;
    let iapSetupStub; let iapValidateStub; let iapIsValidatedStub; let paymentBuySkuStub; let
      iapGetPurchaseDataStub; let validateGiftMessageStub;

    beforeEach(() => {
      token = 'testToken';
      sku = 'com.habitrpg.ios.habitica.iap.21gems';
      user = new User();
      receipt = `{"token": "${token}", "productId": "${sku}"}`;
      headers = {};

      iapSetupStub = sinon.stub(iap, 'setup')
        .resolves();
      iapValidateStub = sinon.stub(iap, 'validate')
        .resolves({});
      iapIsValidatedStub = sinon.stub(iap, 'isValidated').returns(true);
      sinon.stub(iap, 'isExpired').returns(false);
      sinon.stub(iap, 'isCanceled').returns(false);
      iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
        .returns([{
          productId: 'com.habitrpg.ios.Habitica.21gems',
          transactionId: token,
        }]);
      paymentBuySkuStub = sinon.stub(payments, 'buySkuItem').resolves({});
      validateGiftMessageStub = sinon.stub(gems, 'validateGiftMessage');
    });

    afterEach(() => {
      iap.setup.restore();
      iap.validate.restore();
      iap.isValidated.restore();
      iap.isExpired.restore();
      iap.isCanceled.restore();
      iap.getPurchaseData.restore();
      payments.buySkuItem.restore();
      gems.validateGiftMessage.restore();
    });

    it('should throw an error if receipt is invalid', async () => {
      iap.isValidated.restore();
      iapIsValidatedStub = sinon.stub(iap, 'isValidated')
        .returns(false);

      await expect(applePayments.verifyPurchase({ user, receipt, headers }))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: applePayments.constants.RESPONSE_INVALID_RECEIPT,
        });
    });

    it('should throw an error if getPurchaseData is invalid', async () => {
      iapGetPurchaseDataStub.restore();
      iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData').returns([]);

      await expect(applePayments.verifyPurchase({ user, receipt, headers }))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: applePayments.constants.RESPONSE_NO_ITEM_PURCHASED,
        });
    });

    it('errors if the user cannot purchase gems', async () => {
      sinon.stub(user, 'canGetGems').resolves(false);
      await expect(applePayments.verifyPurchase({ user, receipt, headers }))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: i18n.t('groupPolicyCannotGetGems'),
        });

      user.canGetGems.restore();
    });

    it('errors if gemsBlock does not exist', async () => {
      sinon.stub(user, 'canGetGems').resolves(true);
      iapGetPurchaseDataStub.restore();
      iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
        .returns([{
          productId: 'badProduct',
          transactionId: token,
        }]);
      paymentBuySkuStub.restore();

      await expect(applePayments.verifyPurchase({ user, receipt, headers }))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 400,
          name: 'BadRequest',
          message: applePayments.constants.RESPONSE_INVALID_ITEM,
        });

      paymentBuySkuStub = sinon.stub(payments, 'buySkuItem').resolves({});
      user.canGetGems.restore();
    });

    const gemsCanPurchase = [
      {
        productId: 'com.habitrpg.ios.Habitica.4gems',
        gemsBlock: '4gems',
      },
      {
        productId: 'com.habitrpg.ios.Habitica.20gems',
        gemsBlock: '21gems',
      },
      {
        productId: 'com.habitrpg.ios.Habitica.21gems',
        gemsBlock: '21gems',
      },
      {
        productId: 'com.habitrpg.ios.Habitica.42gems',
        gemsBlock: '42gems',
      },
      {
        productId: 'com.habitrpg.ios.Habitica.84gems',
        gemsBlock: '84gems',
      },
    ];

    gemsCanPurchase.forEach(gemTest => {
      it(`purchases ${gemTest.productId} gems`, async () => {
        iapGetPurchaseDataStub.restore();
        iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
          .returns([{
            productId: gemTest.productId,
            transactionId: token,
          }]);

        sinon.stub(user, 'canGetGems').resolves(true);
        await applePayments.verifyPurchase({ user, receipt, headers });

        expect(iapSetupStub).to.be.calledOnce;
        expect(iapValidateStub).to.be.calledOnce;
        expect(iapValidateStub).to.be.calledWith(iap.APPLE, receipt);
        expect(iapIsValidatedStub).to.be.calledOnce;
        expect(iapIsValidatedStub).to.be.calledWith({});
        expect(iapGetPurchaseDataStub).to.be.calledOnce;
        expect(validateGiftMessageStub).to.not.be.called;

        expect(paymentBuySkuStub).to.be.calledOnce;
        expect(paymentBuySkuStub).to.be.calledWith({
          user,
          gift: undefined,
          paymentMethod: applePayments.constants.PAYMENT_METHOD_APPLE,
          sku: gemTest.productId,
          headers,
        });
        expect(user.canGetGems).to.be.calledOnce;
        user.canGetGems.restore();
      });
    });

    it('gifts gems', async () => {
      const receivingUser = new User();
      await receivingUser.save();

      iapGetPurchaseDataStub.restore();
      iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
        .returns([{
          productId: gemsCanPurchase[0].productId,
          transactionId: token,
        }]);

      const gift = { uuid: receivingUser._id };
      await applePayments.verifyPurchase({
        user, gift, receipt, headers,
      });

      expect(iapSetupStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledWith(iap.APPLE, receipt);
      expect(iapIsValidatedStub).to.be.calledOnce;
      expect(iapIsValidatedStub).to.be.calledWith({});
      expect(iapGetPurchaseDataStub).to.be.calledOnce;

      expect(validateGiftMessageStub).to.be.calledOnce;
      expect(validateGiftMessageStub).to.be.calledWith(gift, user);

      expect(paymentBuySkuStub).to.be.calledOnce;
      expect(paymentBuySkuStub).to.be.calledWith({
        user,
        gift: {
          uuid: receivingUser._id,
          member: sinon.match({ _id: receivingUser._id }),
        },
        paymentMethod: applePayments.constants.PAYMENT_METHOD_APPLE,
        sku: 'com.habitrpg.ios.Habitica.4gems',
        headers,
      });
    });
  });

  describe('subscribe', () => {
    let sub; let sku; let user; let token; let receipt; let headers; let
      nextPaymentProcessing;
    let iapSetupStub; let iapValidateStub; let iapIsValidatedStub;
    let paymentsCreateSubscritionStub; let
      iapGetPurchaseDataStub;

    beforeEach(() => {
      sub = common.content.subscriptionBlocks[subKey];
      sku = 'com.habitrpg.ios.habitica.subscription.3month';

      token = 'test-token';
      headers = {};
      receipt = `{"token": "${token}"}`;
      nextPaymentProcessing = moment.utc().add({ days: 2 });
      user = new User();

      iapSetupStub = sinon.stub(iap, 'setup')
        .resolves();
      iapValidateStub = sinon.stub(iap, 'validate')
        .resolves({});
      iapIsValidatedStub = sinon.stub(iap, 'isValidated')
        .returns(true);
      iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
        .returns([{
          expirationDate: moment.utc().subtract({ day: 1 }).toDate(),
          purchaseDate: moment.utc().valueOf(),
          productId: sku,
          transactionId: token,
        }, {
          expirationDate: moment.utc().add({ day: 1 }).toDate(),
          purchaseDate: moment.utc().valueOf(),
          productId: 'wrongsku',
          transactionId: token,
        }, {
          expirationDate: moment.utc().add({ day: 1 }).toDate(),
          purchaseDate: moment.utc().valueOf(),
          productId: sku,
          transactionId: token,
        }]);
      paymentsCreateSubscritionStub = sinon.stub(payments, 'createSubscription').resolves({});
    });

    afterEach(() => {
      iap.setup.restore();
      iap.validate.restore();
      iap.isValidated.restore();
      iap.getPurchaseData.restore();
      if (payments.createSubscription.restore) payments.createSubscription.restore();
    });

    it('should throw an error if receipt is invalid', async () => {
      iap.isValidated.restore();
      iapIsValidatedStub = sinon.stub(iap, 'isValidated')
        .returns(false);

      await expect(applePayments.subscribe(user, receipt, headers, nextPaymentProcessing))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: applePayments.constants.RESPONSE_INVALID_RECEIPT,
        });
    });

    const subOptions = [
      {
        sku: 'subscription1month',
        subKey: 'basic_earned',
      },
      {
        sku: 'com.habitrpg.ios.habitica.subscription.3month',
        subKey: 'basic_3mo',
      },
      {
        sku: 'com.habitrpg.ios.habitica.subscription.6month',
        subKey: 'basic_6mo',
      },
      {
        sku: 'com.habitrpg.ios.habitica.subscription.12month',
        subKey: 'basic_12mo',
      },
    ];
    subOptions.forEach(option => {
      it(`creates a user subscription for ${option.sku}`, async () => {
        iap.getPurchaseData.restore();
        iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
          .returns([{
            expirationDate: moment.utc().add({ day: 2 }).toDate(),
            purchaseDate: new Date(),
            productId: option.sku,
            transactionId: token,
            originalTransactionId: token,
          }]);
        sub = common.content.subscriptionBlocks[option.subKey];

        await applePayments.subscribe(user, receipt, headers, nextPaymentProcessing);

        expect(iapSetupStub).to.be.calledOnce;
        expect(iapValidateStub).to.be.calledOnce;
        expect(iapValidateStub).to.be.calledWith(iap.APPLE, receipt);
        expect(iapIsValidatedStub).to.be.calledOnce;
        expect(iapIsValidatedStub).to.be.calledWith({});
        expect(iapGetPurchaseDataStub).to.be.calledOnce;

        expect(paymentsCreateSubscritionStub).to.be.calledOnce;
        expect(paymentsCreateSubscritionStub).to.be.calledWith({
          user,
          customerId: token,
          paymentMethod: applePayments.constants.PAYMENT_METHOD_APPLE,
          sub,
          headers,
          additionalData: receipt,
          nextPaymentProcessing,
        });
      });
      if (option !== subOptions[3]) {
        const newOption = subOptions[3];
        it(`upgrades a subscription from ${option.sku} to ${newOption.sku}`, async () => {
          const oldSub = common.content.subscriptionBlocks[option.subKey];
          oldSub.logic = 'refundAndRepay';
          user.profile.name = 'sender';
          user.purchased.plan.paymentMethod = applePayments.constants.PAYMENT_METHOD_APPLE;
          user.purchased.plan.customerId = token;
          user.purchased.plan.planId = option.subKey;
          user.purchased.plan.additionalData = receipt;
          iap.getPurchaseData.restore();
          iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
            .returns([{
              expirationDate: moment.utc().add({ day: 2 }).toDate(),
              purchaseDate: moment.utc().valueOf(),
              productId: newOption.sku,
              transactionId: `${token}new`,
              originalTransactionId: token,
            }]);
          sub = common.content.subscriptionBlocks[newOption.subKey];

          await applePayments.subscribe(user,
            receipt,
            headers,
            nextPaymentProcessing);

          expect(iapSetupStub).to.be.calledOnce;
          expect(iapValidateStub).to.be.calledOnce;
          expect(iapValidateStub).to.be.calledWith(iap.APPLE, receipt);
          expect(iapIsValidatedStub).to.be.calledOnce;
          expect(iapIsValidatedStub).to.be.calledWith({});
          expect(iapGetPurchaseDataStub).to.be.calledOnce;

          expect(paymentsCreateSubscritionStub).to.be.calledOnce;
          expect(paymentsCreateSubscritionStub).to.be.calledWith({
            user,
            customerId: token,
            paymentMethod: applePayments.constants.PAYMENT_METHOD_APPLE,
            sub,
            headers,
            additionalData: receipt,
            nextPaymentProcessing,
            updatedFrom: oldSub,
          });
        });
      }
      if (option !== subOptions[0]) {
        const newOption = subOptions[0];
        it(`downgrades a subscription from ${option.sku} to ${newOption.sku}`, async () => {
          const oldSub = common.content.subscriptionBlocks[option.subKey];
          user.profile.name = 'sender';
          user.purchased.plan.paymentMethod = applePayments.constants.PAYMENT_METHOD_APPLE;
          user.purchased.plan.customerId = token;
          user.purchased.plan.planId = option.subKey;
          user.purchased.plan.additionalData = receipt;
          iap.getPurchaseData.restore();
          iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
            .returns([{
              expirationDate: moment.utc().add({ day: 2 }).toDate(),
              purchaseDate: moment.utc().valueOf(),
              productId: newOption.sku,
              transactionId: `${token}new`,
              originalTransactionId: token,
            }]);
          sub = common.content.subscriptionBlocks[newOption.subKey];

          await applePayments.subscribe(user,
            receipt,
            headers,
            nextPaymentProcessing);

          expect(iapSetupStub).to.be.calledOnce;
          expect(iapValidateStub).to.be.calledOnce;
          expect(iapValidateStub).to.be.calledWith(iap.APPLE, receipt);
          expect(iapIsValidatedStub).to.be.calledOnce;
          expect(iapIsValidatedStub).to.be.calledWith({});
          expect(iapGetPurchaseDataStub).to.be.calledOnce;

          expect(paymentsCreateSubscritionStub).to.be.calledOnce;
          expect(paymentsCreateSubscritionStub).to.be.calledWith({
            user,
            customerId: token,
            paymentMethod: applePayments.constants.PAYMENT_METHOD_APPLE,
            sub,
            headers,
            additionalData: receipt,
            nextPaymentProcessing,
            updatedFrom: oldSub,
          });
        });
      }
    });

    it('uses the most recent subscription data', async () => {
      iap.getPurchaseData.restore();
      iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
        .returns([{
          expirationDate: moment.utc().add({ day: 4 }).toDate(),
          purchaseDate: moment.utc().subtract({ day: 5 }).toDate(),
          productId: 'com.habitrpg.ios.habitica.subscription.3month',
          transactionId: `${token}oldest`,
          originalTransactionId: `${token}evenOlder`,
        }, {
          expirationDate: moment.utc().add({ day: 2 }).toDate(),
          purchaseDate: moment.utc().subtract({ day: 1 }).toDate(),
          productId: 'com.habitrpg.ios.habitica.subscription.12month',
          transactionId: `${token}newest`,
          originalTransactionId: `${token}newest`,
        }, {
          expirationDate: moment.utc().add({ day: 1 }).toDate(),
          purchaseDate: moment.utc().subtract({ day: 2 }).toDate(),
          productId: 'com.habitrpg.ios.habitica.subscription.6month',
          transactionId: token,
          originalTransactionId: token,
        }]);
      sub = common.content.subscriptionBlocks.basic_12mo;

      await applePayments.subscribe(user, receipt, headers, nextPaymentProcessing);

      expect(paymentsCreateSubscritionStub).to.be.calledOnce;
      expect(paymentsCreateSubscritionStub).to.be.calledWith({
        user,
        customerId: `${token}newest`,
        paymentMethod: applePayments.constants.PAYMENT_METHOD_APPLE,
        sub,
        headers,
        additionalData: receipt,
        nextPaymentProcessing,
      });
    });

    describe('does not apply multiple times', async () => {
      it('errors when a user is using the same subscription', async () => {
        payments.createSubscription.restore();
        iap.getPurchaseData.restore();
        iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
          .returns([{
            expirationDate: moment.utc().add({ day: 1 }).toDate(),
            purchaseDate: moment.utc().toDate(),
            productId: sku,
            transactionId: token,
            originalTransactionId: token,
          }]);

        await applePayments.subscribe(user, receipt, headers, nextPaymentProcessing);

        await expect(applePayments.subscribe(user, receipt, headers, nextPaymentProcessing))
          .to.eventually.be.rejected.and.to.eql({
            httpCode: 401,
            name: 'NotAuthorized',
            message: applePayments.constants.RESPONSE_ALREADY_USED,
          });
      });

      it('errors when a user is using a rebill of the same subscription', async () => {
        user = new User();
        await user.save();
        payments.createSubscription.restore();
        iap.getPurchaseData.restore();
        iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
          .returns([{
            expirationDate: moment.utc().add({ day: 1 }).toDate(),
            purchaseDate: moment.utc().toDate(),
            productId: sku,
            transactionId: `${token}renew`,
            originalTransactionId: token,
          }]);

        await applePayments.subscribe(user, receipt, headers, nextPaymentProcessing);

        await expect(applePayments.subscribe(user, receipt, headers, nextPaymentProcessing))
          .to.eventually.be.rejected.and.to.eql({
            httpCode: 401,
            name: 'NotAuthorized',
            message: applePayments.constants.RESPONSE_ALREADY_USED,
          });
      });

      it('errors when a different user is using the subscription', async () => {
        user = new User();
        await user.save();
        payments.createSubscription.restore();
        iap.getPurchaseData.restore();
        iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
          .returns([{
            expirationDate: moment.utc().add({ day: 1 }).toDate(),
            purchaseDate: moment.utc().toDate(),
            productId: sku,
            transactionId: token,
            originalTransactionId: token,
          }]);

        await applePayments.subscribe(user, receipt, headers, nextPaymentProcessing);

        const secondUser = new User();
        await secondUser.save();
        await expect(applePayments.subscribe(
          secondUser, receipt, headers, nextPaymentProcessing,
        ))
          .to.eventually.be.rejected.and.to.eql({
            httpCode: 401,
            name: 'NotAuthorized',
            message: applePayments.constants.RESPONSE_ALREADY_USED,
          });
      });

      it('errors when a multiple users exist using the subscription', async () => {
        user = new User();
        await user.save();
        payments.createSubscription.restore();
        iap.getPurchaseData.restore();
        iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
          .returns([{
            expirationDate: moment.utc().add({ day: 1 }).toDate(),
            purchaseDate: moment.utc().toDate(),
            productId: sku,
            transactionId: token,
            originalTransactionId: token,
          }]);

        await applePayments.subscribe(user, receipt, headers, nextPaymentProcessing);
        const secondUser = new User();
        secondUser.purchased.plan = user.purchased.plan;
        secondUser.purchased.plan.dateTerminate = new Date();
        secondUser.save();

        iap.getPurchaseData.restore();
        iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
          .returns([{
            expirationDate: moment.utc().add({ day: 1 }).toDate(),
            purchaseDate: moment.utc().toDate(),
            productId: sku,
            transactionId: `${token}new`,
            originalTransactionId: token,
          }]);

        const thirdUser = new User();
        await thirdUser.save();
        await expect(applePayments.subscribe(
          thirdUser, receipt, headers, nextPaymentProcessing,
        ))
          .to.eventually.be.rejected.and.to.eql({
            httpCode: 401,
            name: 'NotAuthorized',
            message: applePayments.constants.RESPONSE_ALREADY_USED,
          });
      });
    });
  });

  describe('cancelSubscribe ', () => {
    let user; let token; let receipt; let headers; let customerId; let
      expirationDate;
    let iapSetupStub; let iapValidateStub; let iapIsValidatedStub; let iapGetPurchaseDataStub; let
      paymentCancelSubscriptionSpy;

    beforeEach(async () => {
      token = 'test-token';
      headers = {};
      receipt = `{"token": "${token}"}`;
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
      iapIsValidatedStub = sinon.stub(iap, 'isValidated').returns(true);
      sinon.stub(iap, 'isCanceled').returns(false);
      sinon.stub(iap, 'isExpired').returns(true);
      user = new User();
      user.profile.name = 'sender';
      user.purchased.plan.paymentMethod = applePayments.constants.PAYMENT_METHOD_APPLE;
      user.purchased.plan.customerId = customerId;
      user.purchased.plan.planId = subKey;
      user.purchased.plan.additionalData = receipt;

      paymentCancelSubscriptionSpy = sinon.stub(payments, 'cancelSubscription').resolves({});
    });

    afterEach(() => {
      iap.setup.restore();
      iap.validate.restore();
      iap.isValidated.restore();
      iap.isExpired.restore();
      iap.isCanceled.restore();
      iap.getPurchaseData.restore();
      payments.cancelSubscription.restore();
    });

    it('should throw an error if we are missing a subscription', async () => {
      user.purchased.plan.paymentMethod = undefined;

      await expect(applePayments.cancelSubscribe(user, headers))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: i18n.t('missingSubscription'),
        });
    });

    it('should throw an error if subscription is still valid', async () => {
      iap.getPurchaseData.restore();
      iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
        .returns([{ expirationDate: expirationDate.add({ day: 1 }).toDate() }]);
      iap.isExpired.restore();
      sinon.stub(iap, 'isExpired').returns(false);

      await expect(applePayments.cancelSubscribe(user, headers))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: applePayments.constants.RESPONSE_STILL_VALID,
        });
    });

    it('should throw an error if receipt is invalid', async () => {
      iap.isValidated.restore();
      iapIsValidatedStub = sinon.stub(iap, 'isValidated')
        .returns(false);

      await expect(applePayments.cancelSubscribe(user, headers))
        .to.eventually.be.rejected.and.to.eql({
          httpCode: 401,
          name: 'NotAuthorized',
          message: applePayments.constants.RESPONSE_INVALID_RECEIPT,
        });
    });

    it('should cancel a cancelled subscription with termination date in the future', async () => {
      const futureDate = expirationDate.add({ day: 1 });
      iap.getPurchaseData.restore();
      iapGetPurchaseDataStub = sinon.stub(iap, 'getPurchaseData')
        .returns([{ expirationDate: futureDate }]);
      iap.isExpired.restore();
      sinon.stub(iap, 'isExpired').returns(false);

      iap.isCanceled.restore();
      sinon.stub(iap, 'isCanceled').returns(true);

      await applePayments.cancelSubscribe(user, headers);

      expect(iapSetupStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledWith(iap.APPLE, receipt);
      expect(iapIsValidatedStub).to.be.calledOnce;
      expect(iapIsValidatedStub).to.be.calledWith({
        expirationDate: futureDate,
      });
      expect(iapGetPurchaseDataStub).to.be.calledOnce;

      expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
      expect(paymentCancelSubscriptionSpy).to.be.calledWith({
        user,
        paymentMethod: applePayments.constants.PAYMENT_METHOD_APPLE,
        nextBill: futureDate.toDate(),
        headers,
      });
    });

    it('should cancel an expired subscription', async () => {
      await applePayments.cancelSubscribe(user, headers);

      expect(iapSetupStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledOnce;
      expect(iapValidateStub).to.be.calledWith(iap.APPLE, receipt);
      expect(iapIsValidatedStub).to.be.calledOnce;
      expect(iapIsValidatedStub).to.be.calledWith({
        expirationDate,
      });
      expect(iapGetPurchaseDataStub).to.be.calledOnce;

      expect(paymentCancelSubscriptionSpy).to.be.calledOnce;
      expect(paymentCancelSubscriptionSpy).to.be.calledWith({
        user,
        paymentMethod: applePayments.constants.PAYMENT_METHOD_APPLE,
        nextBill: expirationDate.toDate(),
        headers,
      });
    });
  });
});
