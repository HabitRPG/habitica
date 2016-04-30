import mongoose from 'mongoose';
import baseModel from '../libs/api-v3/baseModel';
import { v4 as uuid } from 'uuid';
import validator from 'validator';

let Schema = mongoose.Schema;

export let schema = new Schema({
  _id: false, // use id not _id
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
});

schema.plugin(baseModel, {
  noSet: ['_id', 'id', 'challenge'],
});

export let model = mongoose.model('Tag', schema);
