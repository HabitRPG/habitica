import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  timestamp: Date,
  user: String,
  text: String,
  contributor: {type: mongoose.Schema.Types.Mixed},
  uuid: String,
  id: String,
  groupId: {type: String, ref: 'Group'},
});

export const model = mongoose.model('Chat', schema);
