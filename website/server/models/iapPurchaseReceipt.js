import mongoose from 'mongoose';
import validator from 'validator';
import baseModel from '../libs/baseModel';

const { Schema } = mongoose;

export const schema = new Schema({
  _id: { $type: String, required: true }, // Use a custom string as _id
  consumed: { $type: Boolean, default: false, required: true },
  userId: {
    $type: String, ref: 'User', required: true, validate: [v => validator.isUUID(v), 'Invalid uuid for iapPurchaseReceipt.'],
  },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  typeKey: '$type', // So that we can use fields named `type`
});

schema.plugin(baseModel, {
  noSet: ['id', '_id', 'userId', 'consumed'], // Nothing can be set from the client
  timestamps: true,
  _id: false, // using custom _id
});

export const model = mongoose.model('IapPurchaseReceipt', schema);
