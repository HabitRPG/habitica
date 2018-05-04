import analytics from '../analyticsService';
import {
  getUserInfo,
  sendTxn as txnEmail,
} from '../email';
import { sendNotification as sendPushNotification } from '../pushNotifications';
import shared from '../../../common';

import {
  addSubscriptionToGroupUsers,
  addSubToGroupUser,
  cancelGroupUsersSubscription,
  cancelGroupSubscriptionForUser,
} from './groupPayments';

import {
  createSubscription,
  cancelSubscription,
} from './subscriptions';

let api = {};

api.constants = {
  UNLIMITED_CUSTOMER_ID: 'habitrpg', // Users with the customerId have an unlimted free subscription
  GROUP_PLAN_CUSTOMER_ID: 'group-plan',
  GROUP_PLAN_PAYMENT_METHOD: 'Group Plan',
  GOOGLE_PAYMENT_METHOD: 'Google',
  IOS_PAYMENT_METHOD: 'Apple',
};

api.addSubscriptionToGroupUsers = addSubscriptionToGroupUsers;

api.addSubToGroupUser = addSubToGroupUser;

api.cancelGroupUsersSubscription = cancelGroupUsersSubscription;

api.cancelGroupSubscriptionForUser = cancelGroupSubscriptionForUser;

api.createSubscription = createSubscription;

api.cancelSubscription = cancelSubscription;

api.buyGems = async function buyGems (data) {
  let amt = data.amount || 5;
  amt = data.gift ? data.gift.gems.amount / 4 : amt;

  (data.gift ? data.gift.member : data.user).balance += amt;
  data.user.purchased.txnCount++;

  if (!data.gift) txnEmail(data.user, 'donation');

  analytics.trackPurchase({
    uuid: data.user._id,
    itemPurchased: 'Gems',
    sku: `${data.paymentMethod.toLowerCase()}-checkout`,
    purchaseType: 'checkout',
    paymentMethod: data.paymentMethod,
    quantity: 1,
    gift: Boolean(data.gift),
    purchaseValue: amt,
    headers: data.headers,
  });

  if (data.gift) {
    let byUsername = getUserInfo(data.user, ['name']).name;
    let gemAmount = data.gift.gems.amount || 20;

    // generate the message in both languages, so both users can understand it
    let languages = [data.user.preferences.language, data.gift.member.preferences.language];
    let senderMsg = shared.i18n.t('giftedGemsFull', {
      username: data.gift.member.profile.name,
      sender: byUsername,
      gemAmount,
    }, languages[0]);
    senderMsg = `\`${senderMsg}\``;

    let receiverMsg = shared.i18n.t('giftedGemsFull', {
      username: data.gift.member.profile.name,
      sender: byUsername,
      gemAmount,
    }, languages[1]);
    receiverMsg = `\`${receiverMsg}\``;

    if (data.gift.message) {
      receiverMsg += ` ${data.gift.message}`;
      senderMsg += ` ${data.gift.message}`;
    }

    data.user.sendMessage(data.gift.member, { receiverMsg, senderMsg });

    if (data.gift.member.preferences.emailNotifications.giftedGems !== false) {
      txnEmail(data.gift.member, 'gifted-gems', [
        {name: 'GIFTER', content: byUsername},
        {name: 'X_GEMS_GIFTED', content: gemAmount},
      ]);
    }

    if (data.gift.member._id !== data.user._id) { // Only send push notifications if sending to a user other than yourself
      if (data.gift.member.preferences.pushNotifications.giftedGems !== false) {
        sendPushNotification(
          data.gift.member,
          {
            title: shared.i18n.t('giftedGems', languages[1]),
            message: shared.i18n.t('giftedGemsInfo', {amount: gemAmount, name: byUsername}, languages[1]),
            identifier: 'giftedGems',
          }
        );
      }
    }

    await data.gift.member.save();
  }

  await data.user.save();
};

module.exports = api;
