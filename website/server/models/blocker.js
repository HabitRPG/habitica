/* eslint-disable camelcase */

import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';

export const blockTypes = [
  'ipaddress',
  'email',
  'client',
];

export const blockArea = [
  'full',
  'payments',
];

export const schema = new mongoose.Schema({
  disabled: {
    $type: Boolean, default: false, // If true, the block is disabled
  },
  type: {
    $type: String, enum: blockTypes, required: true,
  },
  area: {
    $type: String, enum: blockArea, default: 'full', // full or payment
  },
  value: {
    $type: String, required: true, // e.g. IP address
  },
  blockSource: {
    $type: String, enum: ['administrator', 'system', 'worker'], default: 'administrator', // who created the block
  },
  reason: {
    $type: String, required: false, // e.g. 'abusive behavior'
  },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  typeKey: '$type', // So that we can use fields named `type`
});

schema.plugin(baseModel, {
  timestamps: true,
});

export const model = mongoose.model('Blocker', schema);
