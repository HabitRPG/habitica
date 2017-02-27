import mongoose from 'mongoose';
import validator from 'validator';

export let schema = new mongoose.Schema({
  text: String,
  notes: String,
  twoHanded: {type: Boolean, default: false},
  per: {type: Number, default: 0},
  int: {type: Number, default: 0},
  str: {type: Number, default: 0},
  con: {type: Number, default: 0},
  value: {type: Number, default: 0},
  type: String,
  key: String,
  setKey: String,
  klass: String,
  index: String,
}, {
  strict: true,
  minimize: false, // So empty objects are returned
});

export let model = mongoose.model('Gear', schema);
