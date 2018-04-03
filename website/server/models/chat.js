import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';

const schema = new mongoose.Schema({
  timestamp: Date,
  user: String,
  text: String,
  contributor: {type: mongoose.Schema.Types.Mixed},
  backer: {type: mongoose.Schema.Types.Mixed},
  uuid: String,
  id: String,
  groupId: {type: String, ref: 'Group'},
  flags: {type: mongoose.Schema.Types.Mixed, default: {}},
  flagCount: {type: Number, default: 0},
  likes: {type: mongoose.Schema.Types.Mixed},
  userStyles: {type: mongoose.Schema.Types.Mixed},
}, {
  minimize: false, // Allow for empty flags to be saved
});

schema.plugin(baseModel, {
  noSet: ['_id'],
  timestamps: true,
});

export const model = mongoose.model('Chat', schema);
