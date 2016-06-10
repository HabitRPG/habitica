import mongoose from 'mongoose';
import baseModel from '../libs/api-v3/baseModel';

const Schema = mongoose.Schema;

export let schema = new Schema({
  regId: {type: String, required: true},
  type: {type: String},
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  _id: false, // use id instead of _id
});

schema.plugin(baseModel, {
  noSet: ['_id'],
  timestamps: true,
  _id: false, // use id instead of _id
});

export let model = mongoose.model('PushDevice', schema);
