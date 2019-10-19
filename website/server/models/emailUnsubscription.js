import mongoose from 'mongoose';
import validator from 'validator';
import baseModel from '../libs/baseModel';

// A collection used to store mailing list unsubscription for non registered email addresses
export const schema = new mongoose.Schema({
  email: {
    $type: String,
    required: true,
    trim: true,
    lowercase: true,
    validator: [v => validator.isEmail(v), 'Invalid email.'],
  },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  typeKey: '$type', // So that we can use fields named `type`
});

schema.plugin(baseModel, {
  noSet: ['_id'],
  timestamps: true,
});

export const model = mongoose.model('EmailUnsubscription', schema);
