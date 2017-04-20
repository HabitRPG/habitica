import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';
import validator from 'validator';

export let schema = new mongoose.Schema({
  planId: String,
  subscriptionId: String,
  owner: {type: String, ref: 'User', validate: [validator.isUUID, 'Invalid uuid.']},
  quantity: {type: Number, default: 1},
  paymentMethod: String, // enum: ['Paypal', 'Stripe', 'Gift', 'Amazon Payments', 'Google', '']}
  customerId: String, // Billing Agreement Id in case of Amazon Payments
  dateCreated: Date,
  dateTerminated: Date,
  dateUpdated: Date,
  extraMonths: {type: Number, default: 0},
  gemsBought: {type: Number, default: 0},
  mysteryItems: {type: Array, default: () => []},
  lastBillingDate: Date, // Used only for Amazon Payments to keep track of billing date
  additionalData: mongoose.Schema.Types.Mixed, // Example for Google: {'receipt': 'serialized receipt json', 'signature': 'signature string'}
  nextPaymentProcessing: Date, // indicates when the queue server should process this subscription again.
  nextBillingDate: Date, // Next time google will bill this user.
  consecutive: {
    count: {type: Number, default: 0},
    offset: {type: Number, default: 0}, // when gifted subs, offset++ for each month. offset-- each new-month (cron). count doesn't ++ until offset==0
    gemCapExtra: {type: Number, default: 0},
    trinkets: {type: Number, default: 0},
  },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  _id: false,
});

schema.plugin(baseModel, {
  private: ['additionalData'],
  noSet: ['_id'],
  timestamps: false,
  _id: false,
});

export let model = mongoose.model('SubscriptionPlan', schema);
