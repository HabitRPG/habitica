import mongoose from 'mongoose';
import validator from 'validator';
import baseModel from '../libs/baseModel';
import { TransactionModel as Transaction } from './transaction';

// multi-month subscriptions are for multiples of 3 months
const SUBSCRIPTION_BASIC_BLOCK_LENGTH = 3;

export const schema = new mongoose.Schema({
  planId: String,
  subscriptionId: String,
  owner: { $type: String, ref: 'User', validate: [v => validator.isUUID(v), 'Invalid uuid for subscription owner.'] },
  quantity: { $type: Number, default: 1 },
  paymentMethod: String, // enum: ['Paypal', 'Stripe', 'Gift', 'Amazon Payments', 'Google', '']}
  customerId: String, // Billing Agreement Id in case of Amazon Payments
  dateCreated: Date,
  dateTerminated: Date,
  dateUpdated: Date,
  dateCurrentTypeCreated: Date,
  extraMonths: { $type: Number, default: 0 },
  perkMonthCount: { $type: Number, default: -1 },
  gemsBought: { $type: Number, default: 0 },
  mysteryItems: { $type: Array, default: () => [] },
  lastReminderDate: Date, // indicates the last time a subscription reminder was sent
  lastBillingDate: Date, // Used only for Amazon Payments to keep track of billing date
  // Example for Google: {'receipt': 'serialized receipt json', 'signature': 'signature string'}
  additionalData: mongoose.Schema.Types.Mixed,
  // indicates when the queue server should process this subscription again.
  nextPaymentProcessing: Date,
  nextBillingDate: Date, // Next time google will bill this user.
  consecutive: {
    count: { $type: Number, default: 0 },
    // when gifted subs, offset++ for each month. offset-- each new-month (cron).
    // count doesn't ++ until offset==0
    offset: { $type: Number, default: 0 },
    gemCapExtra: { $type: Number, default: 0 },
    trinkets: { $type: Number, default: 0 },
  },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  _id: false,
  typeKey: '$type', // So that we can use fields named `type`
});

schema.plugin(baseModel, {
  private: ['additionalData'],
  noSet: ['_id'],
  timestamps: false,
  _id: false,
});

schema.methods.incrementPerkCounterAndReward = async function incrementPerkCounterAndReward
(userID, adding) {
  let addingNumber = adding;
  if (typeof adding === 'string' || adding instanceof String) {
    addingNumber = parseInt(adding, 10);
  }
  const isSingleMonthPlan = this.planId === 'basic_earned' || this.planId === 'group_plan_auto' || this.planId === 'group_monthly';
  // if perkMonthCount wasn't used before, initialize it.
  if (this.perkMonthCount === undefined || this.perkMonthCount === -1) {
    if (isSingleMonthPlan && this.consecutive.count > 0) {
      this.perkMonthCount = (this.consecutive.count - 1) % SUBSCRIPTION_BASIC_BLOCK_LENGTH;
    } else {
      this.perkMonthCount = 0;
    }
  } else if (isSingleMonthPlan) {
    const expectedPerkMonthCount = (this.consecutive.count - 1) % SUBSCRIPTION_BASIC_BLOCK_LENGTH;
    if (this.perkMonthCount === (expectedPerkMonthCount - 1)) {
      // User was affected by a bug that makes their perkMonthCount off by one
      this.perkMonthCount += 1;
    }
  }
  this.perkMonthCount += addingNumber;

  const perks = Math.floor(this.perkMonthCount / 3);
  if (perks > 0) {
    this.consecutive.gemCapExtra += 5 * perks; // 5 extra Gems every 3 months
    // cap it at 50 (hard 25 limit + extra 25)
    if (this.consecutive.gemCapExtra > 25) this.consecutive.gemCapExtra = 25;
    this.perkMonthCount -= (perks * 3);
    // one Hourglass every 3 months
    await this.updateHourglasses(userID, perks, 'subscription_perks'); // eslint-disable-line no-await-in-loop
  }
};

schema.methods.updateHourglasses = async function updateHourglasses (userId,
  amount,
  transactionType,
  reference,
  referenceText) {
  this.consecutive.trinkets += amount;
  await Transaction.create({
    currency: 'hourglasses',
    userId,
    transactionType,
    amount,
    reference,
    referenceText,

    currentAmount: this.consecutive.trinkets,
  });
};

export const model = mongoose.model('SubscriptionPlan', schema);
