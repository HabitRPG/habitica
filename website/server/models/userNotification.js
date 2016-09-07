import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';
import { v4 as uuid } from 'uuid';
import validator from 'validator';

const NOTIFICATION_TYPES = [
  'DROPS_ENABLED',
  'REBIRTH_ENABLED',
  'WON_CHALLENGE',
  'STREAK_ACHIEVEMENT',
  'ULTIMATE_GEAR_ACHIEVEMENT',
  'REBIRTH_ACHIEVEMENT',
  'NEW_CONTRIBUTOR_LEVEL',
  'CRON',
];

const Schema = mongoose.Schema;

export let schema = new Schema({
  id: {
    type: String,
    default: uuid,
    validate: [validator.isUUID, 'Invalid uuid.'],
  },
  type: {type: String, required: true, enum: NOTIFICATION_TYPES},
  data: {type: Schema.Types.Mixed, default: () => {
    return {};
  }},
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  _id: false, // use id instead of _id
});

schema.plugin(baseModel, {
  noSet: ['_id', 'id'],
  timestamps: true,
  private: ['updatedAt'],
  _id: false, // use id instead of _id
});

export let model = mongoose.model('UserNotification', schema);
