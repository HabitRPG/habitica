import shared from '../../common';
import iap from './inAppPurchases';
import payments from './payments';
import {
  NotAuthorized,
  BadRequest,
} from './errors';
import { model as IapPurchaseReceipt } from '../models/iapPurchaseReceipt';
import {model as User } from '../models/user';
import moment from 'moment';

let api = {};

api.constants = {
  PAYMENT_METHOD_GOOGLE: 'Google',
  RESPONSE_INVALID_RECEIPT: 'INVALID_RECEIPT',
  RESPONSE_ALREADY_USED: 'RECEIPT_ALREADY_USED',
  RESPONSE_INVALID_ITEM: 'INVALID_ITEM_PURCHASED',
  RESPONSE_STILL_VALID: 'SUBSCRIPTION_STILL_VALID',
};

api.verifyGemPurchase = async function verifyGemPurchase (user, receipt, signature, headers) {
  const userCanGetGems = await user.canGetGems();
  if (!userCanGetGems) throw new NotAuthorized(shared.i18n.t('groupPolicyCannotGetGems', user.preferences.language));

  await iap.setup();

  let testObj = {
    data: receipt,
    signature,
  };

  let googleRes = await iap.validate(iap.GOOGLE, testObj);

  let isValidated = iap.isValidated(googleRes);
  if (!isValidated) throw new NotAuthorized(this.constants.RESPONSE_INVALID_RECEIPT);

  let receiptObj = typeof testObj.data === 'string' ? JSON.parse(testObj.data) : testObj.data; // passed as a string
  let token = receiptObj.token || receiptObj.purchaseToken;

  let existingReceipt = await IapPurchaseReceipt.findOne({
    _id: token,
  }).exec();
  if (existingReceipt) throw new NotAuthorized(this.constants.RESPONSE_ALREADY_USED);

  await IapPurchaseReceipt.create({
    _id: token,
    consumed: true,
    userId: user._id,
  });

  let amount;

  switch (receiptObj.productId) {
    case 'com.habitrpg.android.habitica.iap.4gems':
      amount = 1;
      break;
    case 'com.habitrpg.android.habitica.iap.20.gems':
    case 'com.habitrpg.android.habitica.iap.21gems':
      amount = 5.25;
      break;
    case 'com.habitrpg.android.habitica.iap.42gems':
      amount = 10.5;
      break;
    case 'com.habitrpg.android.habitica.iap.84gems':
      amount = 21;
      break;
  }

  if (!amount) throw new NotAuthorized(this.constants.RESPONSE_INVALID_ITEM);

  await payments.buyGems({
    user,
    paymentMethod: this.constants.PAYMENT_METHOD_GOOGLE,
    amount,
    headers,
  });

  return googleRes;
};

api.subscribe = async function subscribe (sku, user, receipt, signature, headers, nextPaymentProcessing = undefined) {
  if (!sku) throw new BadRequest(shared.i18n.t('missingSubscriptionCode'));
  let subCode;
  switch (sku) {
    case 'com.habitrpg.android.habitica.subscription.1month':
      subCode = 'basic_earned';
      break;
    case 'com.habitrpg.android.habitica.subscription.3month':
      subCode = 'basic_3mo';
      break;
    case 'com.habitrpg.android.habitica.subscription.6month':
      subCode = 'basic_6mo';
      break;
    case 'com.habitrpg.android.habitica.subscription.12month':
      subCode = 'basic_12mo';
      break;
  }
  let sub = subCode ? shared.content.subscriptionBlocks[subCode] : false;
  if (!sub) throw new NotAuthorized(this.constants.RESPONSE_INVALID_ITEM);

  await iap.setup();

  let testObj = {
    data: receipt,
    signature,
  };

  let receiptObj = typeof receipt === 'string' ? JSON.parse(receipt) : receipt; // passed as a string
  let token = receiptObj.token || receiptObj.purchaseToken;

  let existingUser = await User.findOne({
    'purchased.plan.customerId': token,
  }).exec();
  if (existingUser) throw new NotAuthorized(this.constants.RESPONSE_ALREADY_USED);

  let googleRes = await iap.validate(iap.GOOGLE, testObj);

  let isValidated = iap.isValidated(googleRes);
  if (!isValidated) throw new NotAuthorized(this.constants.RESPONSE_INVALID_RECEIPT);

  nextPaymentProcessing = nextPaymentProcessing ? nextPaymentProcessing : moment.utc().add({days: 2});

  await payments.createSubscription({
    user,
    customerId: token,
    paymentMethod: this.constants.PAYMENT_METHOD_GOOGLE,
    sub,
    headers,
    nextPaymentProcessing,
    additionalData: testObj,
  });
};


api.cancelSubscribe = async function cancelSubscribe (user, headers) {
  let plan = user.purchased.plan;

  if (plan.paymentMethod !== api.constants.PAYMENT_METHOD_GOOGLE) throw new NotAuthorized(shared.i18n.t('missingSubscription'));

  await iap.setup();

  let googleRes = await iap.validate(iap.GOOGLE, plan.additionalData);

  let isValidated = iap.isValidated(googleRes);
  if (!isValidated) throw new NotAuthorized(this.constants.RESPONSE_INVALID_RECEIPT);

  let purchases = iap.getPurchaseData(googleRes);
  if (purchases.length === 0) throw new NotAuthorized(this.constants.RESPONSE_INVALID_RECEIPT);
  let subscriptionData = purchases[0];

  let dateTerminated = new Date(Number(subscriptionData.expirationDate));
  if (dateTerminated > new Date()) throw new NotAuthorized(this.constants.RESPONSE_STILL_VALID);

  await payments.cancelSubscription({
    user,
    nextBill: dateTerminated,
    paymentMethod: this.constants.PAYMENT_METHOD_GOOGLE,
    headers,
  });
};


module.exports = api;
