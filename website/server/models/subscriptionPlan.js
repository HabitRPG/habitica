import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';

export let schema = new mongoose.Schema({
  planId: String,
  subscriptionId: String,
  quantity: {type: Number, default: 1},
  paymentMethod: String, // enum: ['Paypal','Stripe', 'Gift', 'Amazon Payments', '']}
  customerId: String, // Billing Agreement Id in case of Amazon Payments
  dateCreated: Date,
  dateTerminated: Date,
  dateUpdated: Date,
  extraMonths: {type: Number, default: 0},
  gemsBought: {type: Number, default: 0},
  mysteryItems: {type: Array, default: () => []},
  lastBillingDate: Date, // Used only for Amazon Payments to keep track of billing date
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
  noSet: ['_id'],
  timestamps: false,
  _id: false,
});

export let model = mongoose.model('SubscriptionPlan', schema);
