import _ from 'lodash';
import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';
import validator from 'validator';
import baseModel from '../libs/baseModel';

const NOTIFICATION_TYPES = [
  // general notifications
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
  'ITEM_RECEIVED', // notify user when they've got goodies via migration
  // achievement notifications
  'ACHIEVEMENT', // generic achievement notification, details inside `notification.data`
  'CHALLENGE_JOINED_ACHIEVEMENT',
  'GUILD_JOINED_ACHIEVEMENT',
  'ACHIEVEMENT_PARTY_ON',
  'ACHIEVEMENT_PARTY_UP',
  'INVITED_FRIEND_ACHIEVEMENT',
  'REBIRTH_ACHIEVEMENT',
  'STREAK_ACHIEVEMENT',
  'ULTIMATE_GEAR_ACHIEVEMENT',
  'ACHIEVEMENT_STABLE',
  'ACHIEVEMENT_QUESTS',
  'ACHIEVEMENT_ANIMAL_SET',
  'ACHIEVEMENT_PET_COLOR',
  'ACHIEVEMENT_MOUNT_COLOR',
  'ACHIEVEMENT_PET_SET_COMPLETE',
  // Deprecated notification types. Can be removed once old data is cleaned out
  'BOSS_DAMAGE', // deprecated
  'ACHIEVEMENT_ALL_YOUR_BASE', // deprecated
  'ACHIEVEMENT_BACK_TO_BASICS', // deprecated
  'ACHIEVEMENT_JUST_ADD_WATER', // deprecated
  'ACHIEVEMENT_LOST_MASTERCLASSER', // deprecated
  'ACHIEVEMENT_MIND_OVER_MATTER', // deprecated
  'ACHIEVEMENT_DUST_DEVIL', // deprecated
  'ACHIEVEMENT_ARID_AUTHORITY', // deprecated
  'ACHIEVEMENT_PARTY_UP', // deprecated
  'ACHIEVEMENT_PARTY_ON', // deprecated
  'ACHIEVEMENT_BEAST_MASTER', // deprecated
  'ACHIEVEMENT_MOUNT_MASTER', // deprecated
  'ACHIEVEMENT_TRIAD_BINGO', // deprecated
  'ACHIEVEMENT_MONSTER_MAGUS', // deprecated
  'ACHIEVEMENT_UNDEAD_UNDERTAKER', // deprecated
  'ACHIEVEMENT_PRIMED_FOR_PAINTING', // deprecated
  'ACHIEVEMENT_PEARLY_PRO', // deprecated
  'ACHIEVEMENT_TICKLED_PINK', // deprecated
  'ACHIEVEMENT_ROSY_OUTLOOK', // deprecated
  'ACHIEVEMENT_BUG_BONANZA', // deprecated
  'ACHIEVEMENT_BARE_NECESSITIES', // deprecated
  'ACHIEVEMENT_FRESHWATER_FRIENDS', // deprecated
  'ACHIEVEMENT_GOOD_AS_GOLD', // deprecated
  'ACHIEVEMENT_ALL_THAT_GLITTERS', // deprecated
  'ACHIEVEMENT_BONE_COLLECTOR', // deprecated
  'ACHIEVEMENT_SKELETON_CREW', // deprecated
  'ACHIEVEMENT_SEEING_RED', // deprecated
  'ACHIEVEMENT_RED_LETTER_DAY', // deprecated
  'ACHIEVEMENT_LEGENDARY_BESTIARY', // deprecated
  'ACHIEVEMENT_SEASONAL_SPECIALIST', // deprecated
  'ACHIEVEMENT_VIOLETS_ARE_BLUE', // deprecated
  'ACHIEVEMENT_WILD_BLUE_YONDER', // deprecated
  'ACHIEVEMENT_DOMESTICATED', // deprecated
  'ACHIEVEMENT_SHADY_CUSTOMER', // deprecated
  'ACHIEVEMENT_SHADE_OF_IT_ALL', // deprecated
  'ACHIEVEMENT_ZODIAC_ZOOKEEPER', // deprecated
  'ACHIEVEMENT_BIRDS_OF_A_FEATHER', // deprecated
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
