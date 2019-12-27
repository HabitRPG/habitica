import * as analytics from '../analyticsService';
import { // eslint-disable-line import/no-cycle
  getUserInfo,
  sendTxn as txnEmail,
} from '../email';
import { sendNotification as sendPushNotification } from '../pushNotifications';
import shared from '../../../common';

function getGiftMessage (data, byUsername, gemAmount, language) {
  const senderMsg = shared.i18n.t('giftedGemsFull', {
    username: data.gift.member.profile.name,
    sender: byUsername,
    gemAmount,
  }, language);

  const quotedMessage = `\`${senderMsg}\``;

  if (data.gift.message) return `${quotedMessage} ${data.gift.message}`;

  return quotedMessage;
}

async function buyGemGift (data) {
  const byUsername = getUserInfo(data.user, ['name']).name;
  const gemAmount = data.gift.gems.amount || 20;

  const languages = [data.user.preferences.language, data.gift.member.preferences.language];

  const senderMsg = getGiftMessage(data, byUsername, gemAmount, languages[0]);
  const receiverMsg = getGiftMessage(data, byUsername, gemAmount, languages[1]);
  data.user.sendMessage(data.gift.member, { receiverMsg, senderMsg, save: false });

  if (data.gift.member.preferences.emailNotifications.giftedGems !== false) {
    txnEmail(data.gift.member, 'gifted-gems', [
      { name: 'GIFTER', content: byUsername },
      { name: 'X_GEMS_GIFTED', content: gemAmount },
    ]);
  }

  // Only send push notifications if sending to a user other than yourself
  if (
    data.gift.member._id !== data.user._id
    && data.gift.member.preferences.pushNotifications.giftedGems !== false
  ) {
    sendPushNotification(
      data.gift.member,
      {
        title: shared.i18n.t('giftedGems', languages[1]),
        message: shared.i18n.t('giftedGemsInfo', { amount: gemAmount, name: byUsername }, languages[1]),
        identifier: 'giftedGems',
      },
    );
  }

  await data.gift.member.save();
}

function getAmountForGems (data) {
  const amount = data.amount || 5;

  if (data.gift) return data.gift.gems.amount / 4;

  return amount;
}

function updateUserBalance (data, amount) {
  if (data.gift) {
    data.gift.member.balance += amount;
    return;
  }

  data.user.balance += amount;
}

async function buyGems (data) {
  const amt = getAmountForGems(data);

  updateUserBalance(data, amt);
  data.user.purchased.txnCount += 1;

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

  if (data.gift) await buyGemGift(data);

  await data.user.save();
}

export { buyGems }; // eslint-disable-line import/prefer-default-export
