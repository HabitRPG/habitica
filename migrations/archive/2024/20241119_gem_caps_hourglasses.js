/* eslint-disable no-console */
const MIGRATION_NAME = '20241119_gem_caps_hourglasses';
import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count += 1;
  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  const { consecutive, customerId, dateTerminated, planId } = user.purchased.plan;
  const isRecurring = customerId !== 'Gift' && !dateTerminated;
  const updateOp = {
    $set: {
      migration: MIGRATION_NAME,
      'purchased.plan.consecutive.gemCapExtra': Math.max(2 * Math.ceil((consecutive.gemCapExtra + 1) / 2, 26)),
    },
    $inc: {},
  };

  let hourglassBonus = 0;

  if (isRecurring) {
    await user.updateBalance(
      5,
      'admin_update_balance',
      '',
      'Subscription Reward Migration',
    );
    updateOp.$inc.balance = 5;
    switch (planId) {
      case 'basic':
      case 'basic_earned':
      case 'group_plan_auto':
        hourglassBonus = 2;
        break;
      case 'basic_3mo':
      case 'basic_6mo':
      case 'google_6mo':
        hourglassBonus = 4;
        break;
      case 'basic_12mo':
        hourglassBonus = 12;
        updateOp.$set['purchased.plan.hourglassPromoReceived'] = new Date();
        break;
      default:
        hourglassBonus = 0;
    }

    if (hourglassBonus) {
      updateOp.$inc['purchased.plan.consecutive.trinkets'] = hourglassBonus;
      await user.updateHourglasses(
        hourglassBonus,
        'admin_update_balance',
        '',
        'Subscription Reward Migration',
      );
    }
    updateOp.$push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_subscriber_reward',
          title: 'Thanks for being a subscriber!',
          text: 'Enjoy these extra Mystic Hourglasses and Gems to celebrate our new benefits.',
        },
        seen: false,
      },
    };
  }

  return await User.updateOne(
    { _id: user._id },
    updateOp,
  ).exec();
}

export default async function processUsers () {
  let query = {
    migration: { $ne: MIGRATION_NAME },
    'purchased.plan.customerId': { $exists: true },
    $or: [
      { 'purchased.plan.dateTerminated': { $exists: false } },
      { 'purchased.plan.dateTerminated': null },
      { 'purchased.plan.dateTerminated': { $gt: new Date() } },
    ],
  };

  const fields = {
    _id: 1,
    purchased: 1,
  };

  while (true) { // eslint-disable-line no-constant-condition
    const users = await User // eslint-disable-line no-await-in-loop
      .find(query)
      .limit(250)
      .sort({_id: 1})
      .select(fields)
      .exec();

    if (users.length === 0) {
      console.warn('All appropriate users found and modified.');
      console.warn(`\n${count} users processed\n`);
      break;
    } else {
      query._id = {
        $gt: users[users.length - 1],
      };
    }

    await Promise.all(users.map(updateUser)); // eslint-disable-line no-await-in-loop
  }
};
