import mongoose from 'mongoose';
import common from '../../../common';
import validator from 'validator';

// A collection used to store mailing list unsubscription for non registered email addresses
export let schema = new mongoose.Schema({
  _id: {
    type: String,
    default: common.uuid,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true, // TODO migrate existing to lowerCase
    validator: [validator.isEmail, 'Invalid email.'],
  },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
});

export let model = mongoose.model('EmailUnsubscription', schema);
