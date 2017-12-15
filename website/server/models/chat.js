import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';

const schema = new mongoose.Schema({
  timestamp: Date,
  user: String,
  text: String,
  contributor: {type: mongoose.Schema.Types.Mixed},
  uuid: String,
  id: String,
  groupId: {type: String, ref: 'Group'},
  flags: {type: mongoose.Schema.Types.Mixed},
  flagCount: {type: Number, default: 0},
});

schema.plugin(baseModel, {
  noSet: ['_id'],
  timestamps: true,
});

export const model = mongoose.model('Chat', schema);
