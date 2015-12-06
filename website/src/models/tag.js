import mongoose from 'mongoose';
import baseModel from '../libs/api-v3/baseModel';

let Schema = mongoose.Schema;

export let schema = new Schema({
  name: {type: String, required: true},
  challenge: {type: String}, // TODO validate
}, {
  minimize: true, // So empty objects are returned
  strict: true,
});

schema.plugin(baseModel, {
  noSet: ['_id', 'challenge'],
});

export let model = mongoose.model('Tag', schema);
