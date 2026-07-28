import mongoose from 'mongoose';
import validator from 'validator';
import baseModel from '../../libs/baseModel';
import { getAnalyticsDatabase } from '../../libs/mongoose';

const { Schema } = mongoose;
const eventTypes = ['subscribed', 'cancelled', 'resubscribed', 'upgraded', 'downgraded'];

export const schema = new Schema({
  userId: {
    $type: String, required: true, validate: [v => validator.isUUID(v), 'Invalid uuid for user.'],
  },
  ipAddress: { $type: String },
  eventType: { $type: String, enum: eventTypes, required: true },
  paymentMethod: { $type: String },
  customerId: { $type: String },
  planId: { $type: String },
  cancellationReason: { $type: String },
}, {
  strict: true,
  typeKey: '$type',
});

schema.plugin(baseModel, {
  noSet: [
    'id',
    '_id',
    'userId',
    'eventType',
    'paymentMethod',
    'customerId',
    'planId',
    'cancellationReason',
  ], // Nothing can be set from the client
  timestamps: true,
});

export const SubscriptionEventModel = getAnalyticsDatabase().model('SubscriptionEvent', schema);
