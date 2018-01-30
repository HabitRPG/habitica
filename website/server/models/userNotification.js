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
  'GROUP_TASK_NEEDS_WORK',
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
  'NEW_STUFF',
  'NEW_CHAT_MESSAGE',
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
