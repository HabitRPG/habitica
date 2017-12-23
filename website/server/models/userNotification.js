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
  'GROUP_TASK_APPROVAL',
  'GROUP_TASK_APPROVED',
  'LOGIN_INCENTIVE',
  'GROUP_INVITE_ACCEPTED',
  'SCORED_TASK',
  'BOSS_DAMAGE', // Not used currently but kept to avoid validation errors
  'GUILD_PROMPT',
  'GUILD_JOINED_ACHIEVEMENT',
  'CHALLENGE_JOINED_ACHIEVEMENT',
  'INVITED_FRIEND_ACHIEVEMENT',
  'CARD_RECEIVED',
  'NEW_MYSTERY_ITEMS',
  'UNALLOCATED_STATS_POINTS',
  'NEW_INBOX_MESSAGE',
];

const Schema = mongoose.Schema;

export let schema = new Schema({
  id: {
    type: String,
    default: uuid,
    validate: [validator.isUUID, 'Invalid uuid.'],
    required: true,
  },
  type: {type: String, required: true, enum: NOTIFICATION_TYPES},
  data: {type: Schema.Types.Mixed, default: () => {
    return {};
  }},
  // A field to mark the notification as seen without deleting it, optional use
  seen: {type: Boolean, required: true, default: () => false},
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  _id: false, // use id instead of _id
});

schema.plugin(baseModel, {
  noSet: ['_id', 'id'],
  // timestamps: true, // Temporarily removed to debug a possible bug
  _id: false, // use id instead of _id
});

export let model = mongoose.model('UserNotification', schema);
