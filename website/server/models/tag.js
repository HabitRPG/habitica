import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';
import validator from 'validator';
import baseModel from '../libs/baseModel';

const { Schema } = mongoose;

export const schema = new Schema({
  id: {
    $type: String,
    default: uuid,
    validate: [v => validator.isUUID(v), 'Invalid uuid for tag.'],
    required: true,
  },
  name: { $type: String, required: true },
  challenge: { $type: Boolean },
  group: { $type: String },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  _id: false, // use id instead of _id
  typeKey: '$type', // So that we can use fields named `type`
});

schema.plugin(baseModel, {
  noSet: ['_id', 'challenge', 'group'],
  _id: false, // use id instead of _id
});

// A list of additional fields that cannot be updated (but can be set on creation)
const noUpdate = ['id'];
schema.statics.sanitizeUpdate = function sanitizeUpdate (updateObj) {
  return this.sanitize(updateObj, noUpdate);
};

/**
 * Remove invalid data from an array of tags.
 * Fix for https://github.com/HabitRPG/habitica/issues/10688
 * Called by user's post init hook (models/user/hooks.js)
 */
schema.statics.cleanupCorruptData = function cleanupCorruptTagsData (tags) {
  if (!tags) return tags;

  return tags.filter(tag => {
    // Exclude tags with a nullish value or no id
    if (!tag || !tag.id || !tag.name) return false;
    return true;
  });
};

export const model = mongoose.model('Tag', schema);
