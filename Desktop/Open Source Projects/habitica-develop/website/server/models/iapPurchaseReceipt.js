import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';
import validator from 'validator';

const Schema = mongoose.Schema;

export let schema = new Schema({
  _id: {type: String, required: true}, // Use a custom string as _id
  consumed: {type: Boolean, default: false, required: true},
  userId: {type: String, ref: 'User', required: true, validate: [validator.isUUID, 'Invalid uuid.']},
}, {
  strict: true,
  minimize: false, // So empty objects are returned
});

schema.plugin(baseModel, {
  noSet: ['id', '_id', 'userId', 'consumed'], // Nothing can be set from the client
  timestamps: true,
  _id: false, // using custom _id
});

export let model = mongoose.model('IapPurchaseReceipt', schema);
