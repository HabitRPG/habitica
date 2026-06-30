import mongoose from 'mongoose';
import validator from 'validator';
import baseModel from '../../libs/baseModel';
import { getAnalyticsDatabase } from '../../libs/mongoose';

const { Schema } = mongoose;

export const schema = new Schema({
  userId: {
    $type: String, ref: 'User', required: true, validate: [v => validator.isUUID(v), 'Invalid uuid for user.'],
  },
  ipAddress: { $type: String },
  platform: { $type: String },
  authenticationMethod: { $type: String },
  language: { $type: String },
}, {
  strict: true,
  typeKey: '$type',
});

schema.plugin(baseModel, {
  noSet: [
    'id',
    '_id',
    'userId',
    'platform',
    'authenticationMethod',
  ], // Nothing can be set from the client
  timestamps: true,
});

export const RegistrationEventModel = getAnalyticsDatabase().model('RegistrationEvent', schema);
