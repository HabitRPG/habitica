import mongoose from 'mongoose';
import baseModel from '../libs/api-v3/baseModel';
import { v4 as uuid } from 'uuid';
import validator from 'validator';
import common from '../../../common';

const NOTIFICATIONS_TYPES = common.USER_NOTIFICATION_TYPES;
const Schema = mongoose.Schema;

export let schema = new Schema({
  id: {
    type: String,
    default: uuid,
    validate: [validator.isUUID, 'Invalid uuid.'],
  },
  type: {type: String, required: true, enum: NOTIFICATIONS_TYPES},
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
  _id: false, // use id instead of _id
});

export let model = mongoose.model('UserNotification', schema);
