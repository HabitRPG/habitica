import moment from 'moment';
import shared from '../../../common';
import iap from '../inAppPurchases';
import payments from './payments';
import {
  NotAuthorized,
  BadRequest,
} from '../errors';
import { model as IapPurchaseReceipt } from '../../models/iapPurchaseReceipt';
import { model as User } from '../../models/user';
import { validateGiftMessage } from './gems';

const api = {};

api.constants = {
  PAYMENT_METHOD_GOOGLE: 'Google',
  PAYMENT_METHOD_GIFT: 'Google (Gift)',
  RESPONSE_INVALID_RECEIPT: 'INVALID_RECEIPT',
  RESPONSE_ALREADY_USED: 'RECEIPT_ALREADY_USED',
  RESPONSE_INVALID_ITEM: 'INVALID_ITEM_PURCHASED',
  RESPONSE_STILL_VALID: 'SUBSCRIPTION_STILL_VALID',
  RESPONSE_PENDING_SUBSCRIPTION_STATE: 'SUBSCRIPTION_PAYMENT_PENDING',
  RESPONSE_UNSUPPORTED_SUBSCRIPTION_STATE: 'SUBSCRIPTION_UNSUPPORTED_STATE',
};

function getNoRenewSubCodeFromSku (sku) {
  let subCode;
  switch (sku) { // eslint-disable-line default-case
    case 'com.habitrpg.android.habitica.norenew_subscription.1month':
      subCode = 'basic_earned';
      break;
    case 'com.habitrpg.android.habitica.norenew_subscription.3month':
      subCode = 'basic_3mo';
      break;
    case 'com.habitrpg.android.habitica.norenew_subscription.6month':
      subCode = 'basic_6mo';
      break;
    case 'com.habitrpg.android.habitica.norenew_subscription.12month':
      subCode = 'basic_12mo';
      break;
  }
  return subCode;
}

function getPurchaseToken (purchase, googleRes, receiptObj = {}) {
  return purchase.purchaseToken
    || googleRes.purchaseToken
    || receiptObj.token
    || receiptObj.purchaseToken;
}

function getPurchasesFromValidatedResponse (googleRes) {
  const purchases = iap.getPurchaseData(googleRes);
  if (!purchases || purchases.length === 0) {
    throw new NotAuthorized(api.constants.RESPONSE_INVALID_RECEIPT);
  }

  let purchase;
  let newestDate;
  for (const thisPurchase of purchases) {
    const purchaseDateValue = thisPurchase.startTimeMillis
      || thisPurchase.purchaseDate
      || thisPurchase.purchaseTime
      || 0;
    const purchaseDate = new Date(Number(purchaseDateValue));
    if (!purchase || !newestDate || purchaseDate > newestDate) {
      newestDate = purchaseDate;
      purchase = thisPurchase;
    }
  }

  return {
    purchase,
    purchases,
  };
}

function validateSubscriptionLifecycleState (purchase, options = {}) {
  const {
    allowExpired = true,
    allowSystemCanceled = true,
  } = options;

  const paymentState = Number(purchase.paymentState);
  if (paymentState === 0 || paymentState === 3) {
    throw new NotAuthorized(api.constants.RESPONSE_PENDING_SUBSCRIPTION_STATE);
  }

  const cancelReason = Number(purchase.cancelReason);
  const isExpired = purchase.expirationDate > 0 && iap.isExpired(purchase);
  const isSystemCanceled = !Number.isNaN(cancelReason) && cancelReason > 0;

  if (!allowExpired && isExpired) {
    throw new NotAuthorized(api.constants.RESPONSE_INVALID_RECEIPT);
  }

  if (!allowSystemCanceled && isSystemCanceled && !isExpired) {
    throw new NotAuthorized(api.constants.RESPONSE_UNSUPPORTED_SUBSCRIPTION_STATE);
  }
}

function buildAdditionalData (receipt, signature, purchase = {}) {
  const receiptData = typeof receipt === 'string' ? JSON.parse(receipt) : { ...receipt };

  if (purchase.productId) {
    receiptData.productId = purchase.productId;
  }

  const token = purchase.purchaseToken || receiptData.purchaseToken || receiptData.token;
  if (token) {
    receiptData.purchaseToken = token;
    receiptData.token = token;
  }

  if (purchase.linkedPurchaseToken) {
    receiptData.linkedPurchaseToken = purchase.linkedPurchaseToken;
  }

  return {
    data: receiptData,
    signature,
  };
}

api.verifyPurchase = async function verifyPurchase (options) {
  const {
    gift, user, receipt, signature, headers,
  } = options;

  if (gift) {
    gift.member = await User.findById(gift.uuid).exec();
    validateGiftMessage(gift, user);
  }
  const receiver = gift ? gift.member : user;
  const receiverCanGetGems = await receiver.canGetGems();
  if (!receiverCanGetGems) throw new NotAuthorized(shared.i18n.t('groupPolicyCannotGetGems', user.preferences.language));

  await iap.setup();

  const testObj = {
    data: receipt,
    signature,
  };

  const googleRes = await iap.validate(iap.GOOGLE, testObj);

  const isValidated = iap.isValidated(googleRes);
  if (!isValidated) throw new NotAuthorized(this.constants.RESPONSE_INVALID_RECEIPT);

  const receiptObj = typeof testObj.data === 'string' ? JSON.parse(testObj.data) : testObj.data; // passed as a string
  const token = receiptObj.token || receiptObj.purchaseToken;

  const existingReceipt = await IapPurchaseReceipt.findOne({
    _id: token,
  }).exec();
  if (existingReceipt) throw new NotAuthorized(this.constants.RESPONSE_ALREADY_USED);

  await IapPurchaseReceipt.create({
    _id: token,
    consumed: true,
    // This should always be the buying user even for a gift.
    userId: user._id,
  });

  await payments.buySkuItem({ // eslint-disable-line no-await-in-loop
    user,
    gift,
    paymentMethod: api.constants.PAYMENT_METHOD_GOOGLE,
    sku: googleRes.productId,
    headers,
  });

  return googleRes;
};

async function findSubscriptionPurchase (additionalData) {
  const googleRes = await iap.validate(iap.GOOGLE, additionalData);

  const isValidated = iap.isValidated(googleRes);
  if (!isValidated) throw new NotAuthorized(api.constants.RESPONSE_INVALID_RECEIPT);

  const { purchase } = getPurchasesFromValidatedResponse(googleRes);

  return {
    googleRes,
    purchase,
    isCanceled: iap.isCanceled(purchase),
    isExpired: iap.isExpired(purchase),
    expirationDate: new Date(Number(purchase.expirationDate)),
  };
}

async function findReplacementSubscriptionPurchase (additionalData) {
  const receiptData = typeof additionalData.data === 'string'
    ? JSON.parse(additionalData.data)
    : { ...additionalData.data };

  const linkedToken = receiptData.linkedPurchaseToken;
  if (!linkedToken) return null;

  const replacementData = {
    ...additionalData,
    data: {
      ...receiptData,
      token: linkedToken,
      purchaseToken: linkedToken,
    },
  };

  const details = await findSubscriptionPurchase(replacementData);
  return {
    ...details,
    additionalData: replacementData,
    customerId: linkedToken,
  };
}

api.getSubscriptionPaymentDetails = async function getDetails (userId, subscriptionPlan) {
  if (!subscriptionPlan || !subscriptionPlan.additionalData) {
    throw new NotAuthorized(shared.i18n.t('missingSubscription'));
  }
  const details = await findSubscriptionPurchase(subscriptionPlan.additionalData);
  return {
    customerId: details.purchase.purchaseToken,
    originalPurchaseDate: new Date(Number(details.purchase.startTimeMillis)),
    expirationDate: details.isCanceled || details.isExpired ? details.expirationDate : null,
    nextPaymentDate: details.isCanceled || details.isExpired ? null : details.expirationDate,
    productId: details.purchase.productId,
    transactionId: details.purchase.orderId,
    isCanceled: details.isCanceled,
    isExpired: details.isExpired,
  };
};

function getSubCodeFromSku (sku) {
  let subCode;
  switch (sku) { // eslint-disable-line default-case
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
  return subCode;
}

api.subscribe = async function subscribe (
  user,
  receipt,
  signature,
  headers,
  deferredSku = undefined,
) {
  await iap.setup();

  const testObj = {
    data: receipt,
    signature,
  };

  const receiptObj = typeof receipt === 'string' ? JSON.parse(receipt) : receipt; // passed as a string

  let existingSub;
  if (user && user.isSubscribed()) {
    existingSub = shared.content.subscriptionBlocks[user.purchased.plan.planId];
  }

  const googleRes = await iap.validate(iap.GOOGLE, testObj);

  const isValidated = iap.isValidated(googleRes);
  if (!isValidated) throw new NotAuthorized(this.constants.RESPONSE_INVALID_RECEIPT);

  const { purchase, purchases } = getPurchasesFromValidatedResponse(googleRes);
  console.log('purchase', purchase);
  console.log('purchases', purchases);
  validateSubscriptionLifecycleState(purchase, {
    allowExpired: false,
    allowSystemCanceled: false,
  });

  const validatedProductId = purchase.productId || googleRes.productId;
  const subCode = getSubCodeFromSku(validatedProductId);
  const sub = subCode ? shared.content.subscriptionBlocks[subCode] : false;
  if (!sub) throw new NotAuthorized(this.constants.RESPONSE_INVALID_ITEM);

  const token = getPurchaseToken(purchase, googleRes, receiptObj);
  console.log('token', token);
  if (!token) throw new NotAuthorized(this.constants.RESPONSE_INVALID_RECEIPT);

  if (existingSub === sub && user.purchased.plan.customerId === token) {
    throw new NotAuthorized(this.constants.RESPONSE_ALREADY_USED);
  }

  const existingUser = await User.findOne({
    'purchased.plan.customerId': token,
  }).exec();

  if (
    existingUser
    && existingUser._id !== user._id
    && !existingUser.purchased.plan.dateTerminated
  ) {
    throw new NotAuthorized(this.constants.RESPONSE_ALREADY_USED);
  }

  let nextPaymentProcessing = moment.utc().add({ days: 2 }); // eslint-disable-line no-param-reassign, max-len
  let nextBillingDate;
  if (googleRes.expirationDate) {
    nextBillingDate = new Date(Number(googleRes.expirationDate));
    if (nextBillingDate < nextPaymentProcessing.toDate()) {
      nextPaymentProcessing = moment(nextBillingDate);
    }
  }
  const data = {
    user,
    customerId: token,
    paymentMethod: this.constants.PAYMENT_METHOD_GOOGLE,
    sub,
    headers,
    nextPaymentProcessing,
    nextBillingDate,
    additionalData: buildAdditionalData(receipt, signature, purchase),
  };
  if (existingSub) {
    if (purchase.linkedPurchaseToken) {
      const purchaseToken = purchase.linkedPurchaseToken;
      const res = iap.validate(iap.GOOGLE, user.purchased.plan.additionalData);
      const pData = iap.getPurchaseData(res);
      console.log("additionalData", user.purchased.plan.additionalData);
      console.log(res);
      console.log(purchaseToken, pData);
      const deferredSubCode = getSubCodeFromSku(deferredSku);
      if (!deferredSubCode) throw new NotAuthorized(this.constants.RESPONSE_INVALID_ITEM);

      const previousPurchase = purchases
        .find(item => getSubCodeFromSku(item.productId) === deferredSubCode);

      if (!previousPurchase || !previousPurchase.expirationDate) {
        throw new NotAuthorized(this.constants.RESPONSE_INVALID_RECEIPT);
      }

      nextBillingDate = new Date(Number(previousPurchase.expirationDate));
      user.purchased.plan.deferred = {
        planId: deferredSubCode,
        deferredUntil: nextBillingDate,
      };
      user.purchased.plan.customerId = token;
      user.purchased.plan.additionalData = buildAdditionalData(receipt, signature, purchase);
      await user.save();
      // we don't want to do anything else at this point.
      // When the deferring ends we will update the data.
      return;
    }
    data.updatedFrom = existingSub;
    data.updatedFrom.logic = 'payFull';
  }
  await payments.createSubscription(data);
};

api.noRenewSubscribe = async function noRenewSubscribe (options) {
  const {
    gift, user, receipt, signature, headers,
  } = options;
  await iap.setup();

  const testObj = {
    data: receipt,
    signature,
  };

  const googleRes = await iap.validate(iap.GOOGLE, testObj);

  const isValidated = iap.isValidated(googleRes);
  if (!isValidated) throw new NotAuthorized(this.constants.RESPONSE_INVALID_RECEIPT);

  const { purchase } = getPurchasesFromValidatedResponse(googleRes);
  validateSubscriptionLifecycleState(purchase, {
    allowExpired: false,
    allowSystemCanceled: false,
  });

  const validatedProductId = purchase.productId || googleRes.productId;
  const subCode = getNoRenewSubCodeFromSku(validatedProductId);
  const sub = subCode ? shared.content.subscriptionBlocks[subCode] : false;
  if (!sub) throw new NotAuthorized(this.constants.RESPONSE_INVALID_ITEM);

  const token = getPurchaseToken(
    purchase,
    googleRes,
    typeof receipt === 'string' ? JSON.parse(receipt) : receipt,
  );

  if (!token) throw new NotAuthorized(this.constants.RESPONSE_INVALID_RECEIPT);

  const existingReceipt = await IapPurchaseReceipt.findOne({
    _id: token,
  }).exec();
  if (existingReceipt) throw new NotAuthorized(this.constants.RESPONSE_ALREADY_USED);

  await IapPurchaseReceipt.create({
    _id: token,
    consumed: true,
    // This should always be the buying user even for a gift.
    userId: user._id,
  });

  const data = {
    user,
    paymentMethod: this.constants.PAYMENT_METHOD_GOOGLE,
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

  return googleRes;
};

api.cancelSubscribe = async function cancelSubscribe (user, headers) {
  const { plan } = user.purchased;

  if (plan.paymentMethod !== api.constants.PAYMENT_METHOD_GOOGLE) throw new NotAuthorized(shared.i18n.t('missingSubscription'));

  await iap.setup();

  let dateTerminated;

  try {
    const details = await findSubscriptionPurchase(plan.additionalData);
    validateSubscriptionLifecycleState(details.purchase, {
      allowExpired: true,
      allowSystemCanceled: true,
    });
    if (!details.isCanceled && !details.isExpired) {
      throw new NotAuthorized(this.constants.RESPONSE_STILL_VALID);
    }
    dateTerminated = details.expirationDate;
  } catch (err) {
    // Status:410 means that the subsctiption isn't active anymore and we can safely delete it
    if (err && err.message === 'Status:410') {
      const replacement = await findReplacementSubscriptionPurchase(plan.additionalData);

      if (replacement) {
        validateSubscriptionLifecycleState(replacement.purchase, {
          allowExpired: true,
          allowSystemCanceled: true,
        });

        plan.customerId = replacement.customerId;
        plan.additionalData = replacement.additionalData;
        user.markModified('purchased.plan');
        await user.save();

        if (!replacement.isCanceled && !replacement.isExpired) {
          throw new NotAuthorized(this.constants.RESPONSE_STILL_VALID);
        }

        dateTerminated = replacement.expirationDate;
      } else {
        dateTerminated = new Date();
      }
    } else {
      throw err;
    }
  }
  if (dateTerminated) {
    await payments.cancelSubscription({
      user,
      nextBill: dateTerminated,
      paymentMethod: this.constants.PAYMENT_METHOD_GOOGLE,
      headers,
    });
  }
};

export default api;
