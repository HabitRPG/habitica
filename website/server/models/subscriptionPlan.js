import mongoose from 'mongoose';
import validator from 'validator';
import baseModel from '../libs/baseModel';
import { TransactionModel as Transaction } from './transaction';

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
  gemsBought: { $type: Number, default: 0 },
  mysteryItems: { $type: Array, default: () => [] },
  lastReminderDate: Date, // indicates the last time a subscription reminder was sent
  lastBillingDate: Date, // Used only for Amazon Payments to keep track of billing date
  // Example for Google: {'receipt': 'serialized receipt json', 'signature': 'signature string'}
  additionalData: mongoose.Schema.Types.Mixed,
  // indicates when the queue server should process this subscription again.
  nextPaymentProcessing: Date,
  nextBillingDate: Date, // Next time google will bill this user.
  hourglassPromoReceived: Date,
  cumulativeCount: { $type: Number, default: 0 },
  consecutive: {
    count: { $type: Number, default: 0 },
    // when gifted subs, offset++ for each month. offset-- each new-month (cron).
    // count doesn't ++ until offset==0
    offset: { $type: Number, default: 0 },
    gemCapExtra: { $type: Number, default: 0 },
    trinkets: { $type: Number, default: 0 },
    lastHourglassReceived: Date,
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

schema.methods.rewardPerks = async function rewardPerks
(userID, adding) {
  let perks = adding;
  if (typeof adding === 'string' || adding instanceof String) {
    perks = parseInt(adding, 10);
  }

  if (perks > 0) {
    this.consecutive.gemCapExtra += 2 * perks; // 2 extra Gems every month
    // cap it at 50 (hard 24 limit + extra 26)
    if (this.consecutive.gemCapExtra > 26) this.consecutive.gemCapExtra = 26;
    // one Hourglass every month
    await this.updateHourglasses(userID, perks, 'subscription_perks'); // eslint-disable-line no-await-in-loop
  }
};

schema.methods.updateHourglasses = async function updateHourglasses (
  userId,
  amount,
  transactionType,
  reference,
  referenceText,
) {
  this.consecutive.trinkets += amount;
  this.consecutive.lastHourglassReceived = new Date();
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
