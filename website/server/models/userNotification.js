import _ from 'lodash';
import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';
import validator from 'validator';
import baseModel from '../libs/baseModel';

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
  'ACHIEVEMENT', // generic achievement notification, details inside `notification.data`
];

const { Schema } = mongoose;

export const schema = new Schema({
  id: {
    $type: String,
    default: uuid,
    validate: [v => validator.isUUID(v), 'Invalid uuid for userNotification.'],
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
 * Convert notifications to JSON making sure to return only valid data.
 * Fix for https://github.com/HabitRPG/habitica/issues/9923#issuecomment-362869881
 * @TODO Remove once https://github.com/HabitRPG/habitica/issues/9923
 * is fixed
 */
schema.statics.convertNotificationsToSafeJson = function convNotifsToSafeJson (notifications) {
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

  return filteredNotifications.map(n => n.toJSON());
};

schema.plugin(baseModel, {
  noSet: ['_id', 'id'],
  // timestamps: true, // Temporarily removed to debug a possible bug
  _id: false, // use id instead of _id
});

export const model = mongoose.model('UserNotification', schema);
