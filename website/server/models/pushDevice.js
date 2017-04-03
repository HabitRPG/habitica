import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';

const Schema = mongoose.Schema;

export let schema = new Schema({
  regId: {type: String, required: true},
  type: {type: String, required: true, enum: ['ios', 'android']},
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  _id: false,
});

schema.plugin(baseModel, {
  noSet: ['_id', 'regId'],
  timestamps: true,
  _id: false,
});

export let model = mongoose.model('PushDevice', schema);
