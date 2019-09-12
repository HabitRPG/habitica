import shared from '../../../common';
import iap from '../inAppPurchases';
import payments from './payments';
import {
  NotAuthorized,
  BadRequest,
} from '../errors';
import { model as IapPurchaseReceipt } from '../../models/iapPurchaseReceipt';
import {model as User } from '../../models/user';
import moment from 'moment';

let api = {};

api.constants = {
  PAYMENT_METHOD_APPLE: 'Apple',
  PAYMENT_METHOD_GIFT: 'Apple (Gift)',
  RESPONSE_INVALID_RECEIPT: 'INVALID_RECEIPT',
  RESPONSE_ALREADY_USED: 'RECEIPT_ALREADY_USED',
  RESPONSE_INVALID_ITEM: 'INVALID_ITEM_PURCHASED',
  RESPONSE_STILL_VALID: 'SUBSCRIPTION_STILL_VALID',
  RESPONSE_NO_ITEM_PURCHASED: 'NO_ITEM_PURCHASED',
};

api.verifyGemPurchase = async function verifyGemPurchase (options) {
  let {gift, user, receipt, headers} = options;

  if (gift) {
    gift.member = await User.findById(gift.uuid).exec();
  }
  const receiver = gift ? gift.member : user;
  const receiverCanGetGems = await receiver.canGetGems();
  if (!receiverCanGetGems) throw new NotAuthorized(shared.i18n.t('groupPolicyCannotGetGems', user.preferences.language));

  await iap.setup();
  let appleRes = await iap.validate(iap.APPLE, receipt);
  let isValidated = iap.isValidated(appleRes);
  if (!isValidated) throw new NotAuthorized(api.constants.RESPONSE_INVALID_RECEIPT);
  const purchaseDataList = iap.getPurchaseData(appleRes);
  if (purchaseDataList.length === 0) throw new NotAuthorized(api.constants.RESPONSE_NO_ITEM_PURCHASED);
  let correctReceipt = false;

  // Purchasing one item at a time (processing of await(s) below is sequential not parallel)
  for (let index in purchaseDataList) {
    let purchaseData = purchaseDataList[index];
    let token = purchaseData.transactionId;

    let existingReceipt = await IapPurchaseReceipt.findOne({ // eslint-disable-line no-await-in-loop
      _id: token,
    }).exec();

    if (!existingReceipt) {
      await IapPurchaseReceipt.create({ // eslint-disable-line no-await-in-loop
        _id: token,
        consumed: true,
        // This should always be the buying user even for a gift.
        userId: user._id,
      });

      let amount;
      switch (purchaseData.productId) {
        case 'com.habitrpg.ios.Habitica.4gems':
          amount = 1;
          break;
        case 'com.habitrpg.ios.Habitica.20gems':
        case 'com.habitrpg.ios.Habitica.21gems':
          amount = 5.25;
          break;
        case 'com.habitrpg.ios.Habitica.42gems':
          amount = 10.5;
          break;
        case 'com.habitrpg.ios.Habitica.84gems':
          amount = 21;
          break;
      }
      if (amount) {
        correctReceipt = true;
        await payments.buyGems({ // eslint-disable-line no-await-in-loop
          user: receiver,
          paymentMethod: api.constants.PAYMENT_METHOD_APPLE,
          amount,
          headers,
        });
      }
    }
  }

  if (!correctReceipt) throw new NotAuthorized(api.constants.RESPONSE_INVALID_ITEM);

  return appleRes;
};

api.subscribe = async function subscribe (sku, user, receipt, headers, nextPaymentProcessing) {
  if (user && user.isSubscribed()) {
    throw new NotAuthorized(this.constants.RESPONSE_ALREADY_USED);
  }

  if (!sku) throw new BadRequest(shared.i18n.t('missingSubscriptionCode'));

  let subCode;
  switch (sku) {
    case 'subscription1month':
      subCode = 'basic_earned';
      break;
    case 'com.habitrpg.ios.habitica.subscription.3month':
      subCode = 'basic_3mo';
      break;
    case 'com.habitrpg.ios.habitica.subscription.6month':
      subCode = 'basic_6mo';
      break;
    case 'com.habitrpg.ios.habitica.subscription.12month':
      subCode = 'basic_12mo';
      break;
  }
  const sub = subCode ? shared.content.subscriptionBlocks[subCode] : false;
  if (!sub) throw new NotAuthorized(this.constants.RESPONSE_INVALID_ITEM);
  await iap.setup();

  let appleRes = await iap.validate(iap.APPLE, receipt);
  const isValidated = iap.isValidated(appleRes);
  if (!isValidated) throw new NotAuthorized(api.constants.RESPONSE_INVALID_RECEIPT);

  let purchaseDataList = iap.getPurchaseData(appleRes);
  if (purchaseDataList.length === 0) throw new NotAuthorized(api.constants.RESPONSE_NO_ITEM_PURCHASED);

  let transactionId;

  for (let index in purchaseDataList) {
    let purchaseData = purchaseDataList[index];

    let dateTerminated = new Date(Number(purchaseData.expirationDate));
    if (purchaseData.productId === sku && dateTerminated > new Date()) {
      transactionId = purchaseData.transactionId;
      break;
    }
  }

  if (transactionId) {
    let existingUser = await User.findOne({
      'purchased.plan.customerId': transactionId,
    }).exec();
    if (existingUser) throw new NotAuthorized(this.constants.RESPONSE_ALREADY_USED);

    nextPaymentProcessing = nextPaymentProcessing ? nextPaymentProcessing : moment.utc().add({days: 2});

    await payments.createSubscription({
      user,
      customerId: transactionId,
      paymentMethod: this.constants.PAYMENT_METHOD_APPLE,
      sub,
      headers,
      nextPaymentProcessing,
      additionalData: receipt,
    });
  } else {
    throw new NotAuthorized(api.constants.RESPONSE_INVALID_RECEIPT);
  }
};

api.noRenewSubscribe = async function noRenewSubscribe (options) {
  let {sku, gift, user, receipt, headers} = options;

  if (!sku) throw new BadRequest(shared.i18n.t('missingSubscriptionCode'));

  let subCode;
  switch (sku) {
    case 'com.habitrpg.ios.habitica.norenew_subscription.1month':
      subCode = 'basic_earned';
      break;
    case 'com.habitrpg.ios.habitica.norenew_subscription.3month':
      subCode = 'basic_3mo';
      break;
    case 'com.habitrpg.ios.habitica.norenew_subscription.6month':
      subCode = 'basic_6mo';
      break;
    case 'com.habitrpg.ios.habitica.norenew_subscription.12month':
      subCode = 'basic_12mo';
      break;
  }
  const sub = subCode ? shared.content.subscriptionBlocks[subCode] : false;
  if (!sub) throw new NotAuthorized(this.constants.RESPONSE_INVALID_ITEM);
  await iap.setup();

  let appleRes = await iap.validate(iap.APPLE, receipt);
  const isValidated = iap.isValidated(appleRes);
  if (!isValidated) throw new NotAuthorized(api.constants.RESPONSE_INVALID_RECEIPT);

  let purchaseDataList = iap.getPurchaseData(appleRes);
  if (purchaseDataList.length === 0) throw new NotAuthorized(api.constants.RESPONSE_NO_ITEM_PURCHASED);

  let transactionId;

  for (let index in purchaseDataList) {
    let purchaseData = purchaseDataList[index];

    let dateTerminated = new Date(Number(purchaseData.expirationDate));
    if (purchaseData.productId === sku && dateTerminated > new Date()) {
      transactionId = purchaseData.transactionId;
      break;
    }
  }

  if (transactionId) {
    let existingReceipt = await IapPurchaseReceipt.findOne({ // eslint-disable-line no-await-in-loop
      _id: transactionId,
    }).exec();
    if (existingReceipt) throw new NotAuthorized(this.constants.RESPONSE_ALREADY_USED);

    await IapPurchaseReceipt.create({ // eslint-disable-line no-await-in-loop
      _id: transactionId,
      consumed: true,
      // This should always be the buying user even for a gift.
      userId: user._id,
    });
    let data = {
      user,
      paymentMethod: this.constants.PAYMENT_METHOD_APPLE,
      headers,
      sub,
      autoRenews: false,
    };

    if (gift) {
      gift.member = await User.findById(gift.uuid).exec();
      gift.subscription = sub;
      data.gift = gift;
      data.paymentMethod = this.constants.PAYMENT_METHOD_GIFT;
    }

    await payments.createSubscription(data);
  } else {
    throw new NotAuthorized(api.constants.RESPONSE_INVALID_RECEIPT);
  }
};

api.cancelSubscribe = async function cancelSubscribe (user, headers) {
  let plan = user.purchased.plan;

  if (plan.paymentMethod !== api.constants.PAYMENT_METHOD_APPLE) throw new NotAuthorized(shared.i18n.t('missingSubscription'));

  await iap.setup();

  let dateTerminated;

  try {
    let appleRes = await iap.validate(iap.APPLE, plan.additionalData);

    let isValidated = iap.isValidated(appleRes);
    if (!isValidated) throw new NotAuthorized(this.constants.RESPONSE_INVALID_RECEIPT);

    let purchases = iap.getPurchaseData(appleRes);
    if (purchases.length === 0) throw new NotAuthorized(this.constants.RESPONSE_INVALID_RECEIPT);
    let subscriptionData = purchases[0];

    dateTerminated = new Date(Number(subscriptionData.expirationDate));
    if (dateTerminated > new Date()) throw new NotAuthorized(this.constants.RESPONSE_STILL_VALID);
  } catch (err) {
    // If we have an invalid receipt, cancel anyway
    if (!err || !err.validatedData || err.validatedData.is_retryable === true || err.validatedData.status !== 21010) {
      throw err;
    }
  }

  await payments.cancelSubscription({
    user,
    nextBill: dateTerminated,
    paymentMethod: this.constants.PAYMENT_METHOD_APPLE,
    headers,
  });
};


module.exports = api;
