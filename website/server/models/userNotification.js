import _ from 'lodash';
import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';
import validator from 'validator';
import baseModel from '../libs/baseModel';

const NOTIFICATION_TYPES = [
  'DROPS_ENABLED', // unused
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
  'GROUP_TASK_CLAIMED',
  'GROUP_TASK_NEEDS_WORK',
  'LOGIN_INCENTIVE',
  'GROUP_INVITE_ACCEPTED',
  'SCORED_TASK',
  'BOSS_DAMAGE', // Not used currently but kept to avoid validation errors
  'GIFT_ONE_GET_ONE',
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
  'FIRST_DROPS',
  'ONBOARDING_COMPLETE',
  'ACHIEVEMENT_ALL_YOUR_BASE',
  'ACHIEVEMENT_BACK_TO_BASICS',
  'ACHIEVEMENT_JUST_ADD_WATER',
  'ACHIEVEMENT_LOST_MASTERCLASSER',
  'ACHIEVEMENT_MIND_OVER_MATTER',
  'ACHIEVEMENT_DUST_DEVIL',
  'ACHIEVEMENT_ARID_AUTHORITY',
  'ACHIEVEMENT_PARTY_UP',
  'ACHIEVEMENT_PARTY_ON',
  'ACHIEVEMENT_BEAST_MASTER',
  'ACHIEVEMENT_MOUNT_MASTER',
  'ACHIEVEMENT_TRIAD_BINGO',
  'ACHIEVEMENT_MONSTER_MAGUS',
  'ACHIEVEMENT_UNDEAD_UNDERTAKER',
  'ACHIEVEMENT_PRIMED_FOR_PAINTING',
  'ACHIEVEMENT_PEARLY_PRO',
  'ACHIEVEMENT_TICKLED_PINK',
  'ACHIEVEMENT_ROSY_OUTLOOK',
  'ACHIEVEMENT_BUG_BONANZA',
  'ACHIEVEMENT_BARE_NECESSITIES',
  'ACHIEVEMENT_FRESHWATER_FRIENDS',
  'ACHIEVEMENT', // generic achievement notification, details inside `notification.data`
];

const { Schema } = mongoose;

export const schema = new Schema({
  id: {
    $type: String,
    default: uuid,
    validate: [v => validator.isUUID(v), 'Invalid uuid for userNotification.'],
    required: true,
  },
  type: {
    $type: String,
    required: true,
    enum: NOTIFICATION_TYPES,
  },
  data: {
    $type: Schema.Types.Mixed,
    default: () => ({}),
  },
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
 * Remove invalid data from an array of notifications.
 * Fix for https://github.com/HabitRPG/habitica/issues/9923
 * Called by user's post init hook (models/user/hooks.js)
 */
schema.statics.cleanupCorruptData = function cleanupCorruptNotificationsData (notifications) {
  if (!notifications) return notifications;

  let filteredNotifications = notifications.filter(notification => {
    // Exclude notifications with a nullish value, no id or no type
    if (!notification || !notification.id || !notification.type) return false;
    return true;
  });

  // Remove duplicate NEW_CHAT_MESSAGES notifications
  // can be caused by a race condition when adding a new notification of this type
  // in group.sendChat if two messages are posted at the same time
  filteredNotifications = _.uniqWith(filteredNotifications, (val, otherVal) => {
    if (val.type === 'NEW_CHAT_MESSAGE' && val.type === otherVal.type) {
      return val.data.group.id === otherVal.data.group.id;
    }
    return false;
  });

  return filteredNotifications;
};

schema.plugin(baseModel, {
  noSet: ['_id', 'id'],
  // timestamps: true, // Temporarily removed to debug a possible bug
  _id: false, // use id instead of _id
});

export const model = mongoose.model('UserNotification', schema);
