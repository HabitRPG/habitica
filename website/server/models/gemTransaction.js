import mongoose from 'mongoose';
import validator from 'validator';
import baseModel from '../libs/baseModel';

const { Schema } = mongoose;

export const transactionTypes = ['buy_money', 'buy_gold', 'contribution', 'spend', 'gift_send', 'gift_receive', 'debug', 'create_challenge', 'create_guild', 'change_class', 'rebirth', 'release_pets', 'release_mounts', 'reroll', 'contribution'];

export const schema = new Schema({
  transactionType: {
    $type: String, enum: transactionTypes, required: true, default: transactionTypes[0],
  },
  reference: { $type: String }, // Use a custom string as _id
  amount: { $type: Number, required: true },
  userId: {
    $type: String, ref: 'User', required: true, validate: [v => validator.isUUID(v), 'Invalid uuid for gemTransaction.'],
  },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  typeKey: '$type', // So that we can use fields named `type`
});

schema.plugin(baseModel, {
  noSet: ['id', '_id', 'userId', 'transactionType', 'reference', 'amount'], // Nothing can be set from the client
  timestamps: true,
  _id: false, // using custom _id
});

export const model = mongoose.model('GemTransaction', schema);
