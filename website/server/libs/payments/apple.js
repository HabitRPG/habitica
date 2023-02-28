import moment from 'moment';
import shared from '../../../common';
import iap from '../inAppPurchases';
import payments from './payments';
import { validateGiftMessage } from './gems';
import {
  NotAuthorized,
  BadRequest,
} from '../errors';
import { model as IapPurchaseReceipt } from '../../models/iapPurchaseReceipt';
import { model as User } from '../../models/user';

const api = {};

api.constants = {
  PAYMENT_METHOD_APPLE: 'Apple',
  PAYMENT_METHOD_GIFT: 'Apple (Gift)',
  RESPONSE_INVALID_RECEIPT: 'INVALID_RECEIPT',
  RESPONSE_ALREADY_USED: 'RECEIPT_ALREADY_USED',
  RESPONSE_INVALID_ITEM: 'INVALID_ITEM_PURCHASED',
  RESPONSE_STILL_VALID: 'SUBSCRIPTION_STILL_VALID',
  RESPONSE_NO_ITEM_PURCHASED: 'NO_ITEM_PURCHASED',
};

api.verifyPurchase = async function verifyPurchase (options) {
  const {
    gift, user, receipt, headers,
  } = options;

  if (gift) {
    validateGiftMessage(gift, user);
    gift.member = await User.findById(gift.uuid).exec();
  }

  const receiver = gift ? gift.member : user;
  const receiverCanGetGems = await receiver.canGetGems();
  if (!receiverCanGetGems) throw new NotAuthorized(shared.i18n.t('groupPolicyCannotGetGems', user.preferences.language));

  await iap.setup();
  const appleRes = await iap.validate(iap.APPLE, receipt);
  const isValidated = iap.isValidated(appleRes);
  if (!isValidated) throw new NotAuthorized(api.constants.RESPONSE_INVALID_RECEIPT);
  const purchaseDataList = iap.getPurchaseData(appleRes);
  if (purchaseDataList.length === 0) {
    throw new NotAuthorized(api.constants.RESPONSE_NO_ITEM_PURCHASED);
  }

  // Purchasing one item at a time (processing of await(s) below is sequential not parallel)
  for (const purchaseData of purchaseDataList) {
    const token = purchaseData.transactionId;

    const existingReceipt = await IapPurchaseReceipt.findOne({ // eslint-disable-line no-await-in-loop, max-len
      _id: token,
    }).exec();

    if (!existingReceipt) {
      await IapPurchaseReceipt.create({ // eslint-disable-line no-await-in-loop
        _id: token,
        consumed: true,
        // This should always be the buying user even for a gift.
        userId: user._id,
      });

      await payments.buySkuItem({ // eslint-disable-line no-await-in-loop
        user,
        gift,
        paymentMethod: api.constants.PAYMENT_METHOD_APPLE,
        sku: purchaseData.productId,
        headers,
      });
    }
  }

  return appleRes;
};

api.subscribe = async function subscribe (user, receipt, headers, nextPaymentProcessing) {
  await iap.setup();

  const appleRes = await iap.validate(iap.APPLE, receipt);
  const isValidated = iap.isValidated(appleRes);
  if (!isValidated) throw new NotAuthorized(api.constants.RESPONSE_INVALID_RECEIPT);

  const purchaseDataList = iap.getPurchaseData(appleRes);
  if (purchaseDataList.length === 0) {
    throw new NotAuthorized(api.constants.RESPONSE_NO_ITEM_PURCHASED);
  }

  let purchase;
  let newestDate;

  for (const purchaseData of purchaseDataList) {
    const datePurchased = new Date(Number(purchaseData.purchaseDate));
    const dateTerminated = new Date(Number(purchaseData.expirationDate));
    if ((!newestDate || datePurchased > newestDate) && dateTerminated > new Date()) {
      purchase = purchaseData;
      newestDate = datePurchased;
    }
  }

  let subCode;
  switch (purchase.productId) { // eslint-disable-line default-case
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

  if (purchase.originalTransactionId) {
    let existingSub;
    if (user && user.isSubscribed()) {
      if (user.purchased.plan.customerId !== purchase.originalTransactionId) {
        throw new NotAuthorized(this.constants.RESPONSE_ALREADY_USED);
      }
      existingSub = shared.content.subscriptionBlocks[user.purchased.plan.planId];
      if (existingSub === sub) {
        throw new NotAuthorized(this.constants.RESPONSE_ALREADY_USED);
      }
    }
    const existingUsers = await User.find({
      $or: [
        { 'purchased.plan.customerId': purchase.originalTransactionId },
        { 'purchased.plan.customerId': purchase.transactionId },
      ],
    }).exec();
    if (existingUsers.length > 0) {
      if (purchase.originalTransactionId === purchase.transactionId) {
        throw new NotAuthorized(this.constants.RESPONSE_ALREADY_USED);
      }
      for (const existingUser of existingUsers) {
        if (existingUser._id !== user._id && !existingUser.purchased.plan.dateTerminated) {
          throw new NotAuthorized(this.constants.RESPONSE_ALREADY_USED);
        }
      }
    }

    nextPaymentProcessing = nextPaymentProcessing || moment.utc().add({ days: 2 }); // eslint-disable-line max-len, no-param-reassign
    const terminationDate = moment(Number(purchase.expirationDate));
    if (nextPaymentProcessing > terminationDate) {
      // For test subscriptions that have a significantly shorter expiration period, this is better
      nextPaymentProcessing = terminationDate; // eslint-disable-line no-param-reassign
    }

    const data = {
      user,
      customerId: purchase.originalTransactionId,
      paymentMethod: this.constants.PAYMENT_METHOD_APPLE,
      sub,
      headers,
      nextPaymentProcessing,
      additionalData: receipt,
    };
    if (existingSub) {
      data.updatedFrom = existingSub;
      data.updatedFrom.logic = 'refundAndRepay';
    }
    await payments.createSubscription(data);
  } else {
    throw new NotAuthorized(api.constants.RESPONSE_INVALID_RECEIPT);
  }
};

api.noRenewSubscribe = async function noRenewSubscribe (options) {
  const {
    sku, gift, user, receipt, headers,
  } = options;

  if (!sku) throw new BadRequest(shared.i18n.t('missingSubscriptionCode'));

  let subCode;
  switch (sku) { // eslint-disable-line default-case
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

  const appleRes = await iap.validate(iap.APPLE, receipt);
  const isValidated = iap.isValidated(appleRes);
  if (!isValidated) throw new NotAuthorized(api.constants.RESPONSE_INVALID_RECEIPT);

  const purchaseDataList = iap.getPurchaseData(appleRes);
  if (purchaseDataList.length === 0) {
    throw new NotAuthorized(api.constants.RESPONSE_NO_ITEM_PURCHASED);
  }

  let correctReceipt = false;

  /* eslint-disable no-await-in-loop */
  for (const purchaseData of purchaseDataList) {
    if (purchaseData.productId === sku) {
      const { transactionId } = purchaseData;
      const existingReceipt = await IapPurchaseReceipt.findOne({
        _id: transactionId,
      }).exec();
      if (existingReceipt) throw new NotAuthorized(this.constants.RESPONSE_ALREADY_USED);

      await IapPurchaseReceipt.create({
        _id: transactionId,
        consumed: true,
        // This should always be the buying user even for a gift.
        userId: user._id,
      });
      const data = {
        user,
        paymentMethod: this.constants.PAYMENT_METHOD_APPLE,
        headers,
        sub,
        autoRenews: false,
      };

      if (gift) {
        validateGiftMessage(gift, user);
        gift.member = await User.findById(gift.uuid).exec();
        gift.subscription = sub;
        data.gift = gift;
        data.paymentMethod = this.constants.PAYMENT_METHOD_GIFT;
      }

      await payments.createSubscription(data);
      correctReceipt = true;
      break;
    }
  }
  if (!correctReceipt) throw new NotAuthorized(api.constants.RESPONSE_INVALID_ITEM);

  return appleRes;
};
/* eslint-enable no-await-in-loop */

api.cancelSubscribe = async function cancelSubscribe (user, headers) {
  const { plan } = user.purchased;

  if (plan.paymentMethod !== api.constants.PAYMENT_METHOD_APPLE) throw new NotAuthorized(shared.i18n.t('missingSubscription'));

  await iap.setup();

  try {
    const appleRes = await iap.validate(iap.APPLE, plan.additionalData);

    const isValidated = iap.isValidated(appleRes);
    if (!isValidated) throw new NotAuthorized(this.constants.RESPONSE_INVALID_RECEIPT);

    const purchases = iap.getPurchaseData(appleRes);
    if (purchases.length === 0) throw new NotAuthorized(this.constants.RESPONSE_INVALID_RECEIPT);
    let newestDate;
    let newestPurchase;

    for (const purchaseData of purchases) {
      const datePurchased = new Date(Number(purchaseData.purchaseDate));
      if (!newestDate || datePurchased > newestDate) {
        newestDate = datePurchased;
        newestPurchase = purchaseData;
      }
    }

    if (!iap.isCanceled(newestPurchase) && !iap.isExpired(newestPurchase)) {
      throw new NotAuthorized(this.constants.RESPONSE_STILL_VALID);
    }

    await payments.cancelSubscription({
      user,
      nextBill: new Date(Number(newestPurchase.expirationDate)),
      paymentMethod: this.constants.PAYMENT_METHOD_APPLE,
      headers,
    });
  } catch (err) {
    // If we have an invalid receipt, cancel anyway
    if (
      !err || !err.validatedData || err.validatedData.is_retryable === true
      || err.validatedData.status !== 21010
    ) {
      throw err;
    }
  }
};

export default api;
