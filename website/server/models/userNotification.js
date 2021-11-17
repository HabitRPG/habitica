import _ from 'lodash';
import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';
import validator from 'validator';
import baseModel from '../libs/baseModel';

const NOTIFICATION_TYPES = [
  // general notifications
  'BOSS_DAMAGE', // Not used currently but kept to avoid validation errors
  'CARD_RECEIVED',
  'CRON',
  'DROP_CAP_REACHED',
  'DROPS_ENABLED', // unused
  'FIRST_DROPS',
  'GIFT_ONE_GET_ONE',
  'GROUP_INVITE_ACCEPTED',
  'GROUP_TASK_APPROVAL',
  'GROUP_TASK_APPROVED',
  'GROUP_TASK_ASSIGNED',
  'GROUP_TASK_CLAIMED',
  'GROUP_TASK_NEEDS_WORK',
  'GUILD_PROMPT',
  'LEVELED_UP', // not in use
  'LOGIN_INCENTIVE',
  'NEW_CHAT_MESSAGE',
  'NEW_CONTRIBUTOR_LEVEL',
  'NEW_INBOX_MESSAGE',
  'NEW_MYSTERY_ITEMS',
  'NEW_STUFF',
  'ONBOARDING_COMPLETE',
  'REBIRTH_ENABLED',
  'SCORED_TASK',
  'UNALLOCATED_STATS_POINTS',
  'WON_CHALLENGE',
  // achievement notifications
  'ACHIEVEMENT', // generic achievement notification, details inside `notification.data`
  'ACHIEVEMENT_CHALLENGE_JOINED',
  'ACHIEVEMENT_GUILD_JOINED',
  'ACHIEVEMENT_PARTY_ON',
  'ACHIEVEMENT_PARTY_UP',
  'ACHIEVEMENT_INVITED_FRIEND',
  'ACHIEVEMENT_REBIRTH',
  'ACHIEVEMENT_STREAK',
  'ACHIEVEMENT_ULTIMATE_GEAR',
  // stable achievements
  'ACHIEVEMENT_BEAST_MASTER',
  'ACHIEVEMENT_MOUNT_MASTER',
  'ACHIEVEMENT_TRIAD_BINGO',
  // quest achievements
  'ACHIEVEMENT_BARE_NECESSITIES',
  'ACHIEVEMENT_BUG_BONANZA',
  'ACHIEVEMENT_FRESHWATER_FRIENDS',
  'ACHIEVEMENT_JUST_ADD_WATER',
  'ACHIEVEMENT_LOST_MASTERCLASSER',
  'ACHIEVEMENT_MIND_OVER_MATTER',
  'ACHIEVEMENT_SEASONAL_SPECIALIST',
  // animal set achievements
  'ACHIEVEMENT_DOMESTICATED',
  'ACHIEVEMENT_LEGENDARY_BESTIARY',
  // pet and mount color collection achievement notifications
  // 'ACHIEVEMENT_PET_COLOR',
  // 'ACHIEVEMENT_MOUNT_COLOR',
  // pet and mount color achievements
  'ACHIEVEMENT_ALL_YOUR_BASE',
  'ACHIEVEMENT_BACK_TO_BASICS',
  'ACHIEVEMENT_DUST_DEVIL',
  'ACHIEVEMENT_ARID_AUTHORITY',
  'ACHIEVEMENT_MONSTER_MAGUS',
  'ACHIEVEMENT_UNDEAD_UNDERTAKER',
  'ACHIEVEMENT_PRIMED_FOR_PAINTING',
  'ACHIEVEMENT_PEARLY_PRO',
  'ACHIEVEMENT_TICKLED_PINK',
  'ACHIEVEMENT_ROSY_OUTLOOK',
  'ACHIEVEMENT_GOOD_AS_GOLD',
  'ACHIEVEMENT_ALL_THAT_GLITTERS',
  'ACHIEVEMENT_BONE_COLLECTOR',
  'ACHIEVEMENT_SKELETON_CREW',
  'ACHIEVEMENT_SEEING_RED',
  'ACHIEVEMENT_RED_LETTER_DAY',
  'ACHIEVEMENT_VIOLETS_ARE_BLUE',
  'ACHIEVEMENT_WILD_BLUE_YONDER',
  'ACHIEVEMENT_SHADY_CUSTOMER',
  'ACHIEVEMENT_SHADE_OF_IT_ALL',
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
