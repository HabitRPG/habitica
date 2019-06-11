import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';
import { v4 as uuid } from 'uuid';
import validator from 'validator';
import _ from 'lodash';

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
  'GROUP_TASK_ASSIGNED',
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
  'LEVELED_UP',
  'ACHIEVEMENT_ALL_YOUR_BASE',
  'ACHIEVEMENT_BACK_TO_BASICS',
  'ACHIEVEMENT_JUST_ADD_WATER',
  'ACHIEVEMENT_LOST_MASTERCLASSER',
  'ACHIEVEMENT_MIND_OVER_MATTER',
];

const Schema = mongoose.Schema;

export let schema = new Schema({
  id: {
    $type: String,
    default: uuid,
    validate: [v => validator.isUUID(v), 'Invalid uuid.'],
    // @TODO: Add these back once we figure out the issue with notifications
    // See Fix for https://github.com/HabitRPG/habitica/issues/9923
    // required: true,
  },
  type: {
    $type: String,
    // @TODO: Add these back once we figure out the issue with notifications
    // See Fix for https://github.com/HabitRPG/habitica/issues/9923
    // required: true,
    enum: NOTIFICATION_TYPES,
  },
  data: {$type: Schema.Types.Mixed, default: () => {
    return {};
  }},
  // A field to mark the notification as seen without deleting it, optional use
  seen: {
    $type: Boolean,
    // required: true,
    default: () => false,
  },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  _id: false, // use id instead of _id,
  typeKey: '$type', // So that we can use fields named `type`
});

/**
 * Convert notifications to JSON making sure to return only valid data.
 * Fix for https://github.com/HabitRPG/habitica/issues/9923#issuecomment-362869881
 * @TODO Remove once https://github.com/HabitRPG/habitica/issues/9923
 * is fixed
 */
schema.statics.convertNotificationsToSafeJson = function convertNotificationsToSafeJson (notifications) {
  if (!notifications) return notifications;

  let filteredNotifications = notifications.filter(n => {
    // Exclude notifications with a nullish value
    if (!n) return false;
    // Exclude notifications without an id or a type
    if (!n.id || !n.type) return false;
    return true;
  });

  filteredNotifications = _.uniqWith(filteredNotifications, (val, otherVal) => {
    if (val.type === otherVal.type && val.type === 'NEW_CHAT_MESSAGE') {
      return val.data.group.id === otherVal.data.group.id;
    }
    return false;
  });

  return filteredNotifications.map(n => {
    return n.toJSON();
  });
};

schema.plugin(baseModel, {
  noSet: ['_id', 'id'],
  // timestamps: true, // Temporarily removed to debug a possible bug
  _id: false, // use id instead of _id
});

export let model = mongoose.model('UserNotification', schema);
