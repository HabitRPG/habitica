import mongoose from 'mongoose';
import validator from 'validator';
import baseModel from '../libs/baseModel';

// A collection used to store mailing list unsubscription for non registered email addresses
export let schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validator: [validator.isEmail, 'Invalid email.'],
  },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
});

schema.plugin(baseModel, {
  noSet: ['_id'],
  timestamps: true,
});

export let model = mongoose.model('EmailUnsubscription', schema);
