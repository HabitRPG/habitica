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
  },
  name: {type: String, required: true},
  challenge: {type: String},
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  _id: false, // use id instead of _id
});

schema.plugin(baseModel, {
  noSet: ['_id', 'id', 'challenge'],
  _id: false, // use id instead of _id
});

export let model = mongoose.model('Tag', schema);
