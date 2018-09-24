import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';
import { v4 as uuid } from 'uuid';
import { defaults } from 'lodash';

const defaultSchema = () => ({
  id: String,
  timestamp: Date,
  text: String,

  // sender properties
  user: String, // profile name
  contributor: {type: mongoose.Schema.Types.Mixed},
  backer: {type: mongoose.Schema.Types.Mixed},
  uuid: String, // sender uuid
  userStyles: {type: mongoose.Schema.Types.Mixed},

  flags: {type: mongoose.Schema.Types.Mixed, default: {}},
  flagCount: {type: Number, default: 0},
  likes: {type: mongoose.Schema.Types.Mixed},
  _meta: {type: mongoose.Schema.Types.Mixed},
});

const chatSchema = new mongoose.Schema({
  ...defaultSchema(),
  groupId: {type: String, ref: 'Group'},
}, {
  minimize: false, // Allow for empty flags to be saved
});

chatSchema.plugin(baseModel, {
  noSet: ['_id'],
});

const inboxSchema = new mongoose.Schema({
  sent: {type: Boolean, default: false}, // if the owner sent this message
  // the uuid of the user where the message is stored,
  // we store two copies of each inbox messages:
  // one for the sender and one for the receiver
  ownerId: {type: String, ref: 'User'},
  ...defaultSchema(),
}, {
  minimize: false, // Allow for empty flags to be saved
});

inboxSchema.plugin(baseModel, {
  noSet: ['_id'],
});

export const chatModel = mongoose.model('Chat', chatSchema);
export const inboxModel = mongoose.model('Inbox', inboxSchema);

export function setUserStyles (newMessage, user) {
  let userStyles = {};
  userStyles.items = {gear: {}};

  let userCopy = user;
  if (user.toObject) userCopy = user.toObject();

  if (userCopy.items) {
    userStyles.items.gear = {};
    userStyles.items.gear.costume = Object.assign({}, userCopy.items.gear.costume);
    userStyles.items.gear.equipped = Object.assign({}, userCopy.items.gear.equipped);

    userStyles.items.currentMount = userCopy.items.currentMount;
    userStyles.items.currentPet = userCopy.items.currentPet;
  }


  if (userCopy.preferences) {
    userStyles.preferences = {};
    if (userCopy.preferences.style) userStyles.preferences.style = userCopy.preferences.style;
    userStyles.preferences.hair = userCopy.preferences.hair;
    userStyles.preferences.skin = userCopy.preferences.skin;
    userStyles.preferences.shirt = userCopy.preferences.shirt;
    userStyles.preferences.chair = userCopy.preferences.chair;
    userStyles.preferences.size = userCopy.preferences.size;
    userStyles.preferences.chair = userCopy.preferences.chair;
    userStyles.preferences.background = userCopy.preferences.background;
    userStyles.preferences.costume = userCopy.preferences.costume;
  }

  if (userCopy.stats) {
    userStyles.stats = {};
    userStyles.stats.class = userCopy.stats.class;
    if (userCopy.stats.buffs) {
      userStyles.stats.buffs = {
        seafoam: userCopy.stats.buffs.seafoam,
        shinySeed: userCopy.stats.buffs.shinySeed,
        spookySparkles: userCopy.stats.buffs.spookySparkles,
        snowball: userCopy.stats.buffs.snowball,
      };
    }
  }

  newMessage.userStyles = userStyles;
  newMessage.markModified('userStyles');
}

export function messageDefaults (msg, user) {
  const id = uuid();
  const message = {
    id,
    _id: id,
    text: msg.substring(0, 3000),
    timestamp: Number(new Date()),
    likes: {},
    flags: {},
    flagCount: 0,
  };

  if (user) {
    defaults(message, {
      uuid: user._id,
      contributor: user.contributor && user.contributor.toObject(),
      backer: user.backer && user.backer.toObject(),
      user: user.profile.name,
    });
  } else {
    message.uuid = 'system';
  }

  return message;
}
