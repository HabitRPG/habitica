import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';
import { v4 as uuid } from 'uuid';
import validator from 'validator';

const Schema = mongoose.Schema;

export let schema = new Schema({
  id: {
    type: String,
    default: uuid,
    validate: [validator.isUUID, 'Invalid uuid.'],
    required: true,
  },
  name: {type: String, required: true},
  challenge: {type: String},
  group: {type: String},
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  _id: false, // use id instead of _id
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

export let model = mongoose.model('Tag', schema);
