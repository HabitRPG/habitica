/* eslint-disable camelcase */

import mongoose from 'mongoose';
import validator from 'validator';
import baseModel from '../libs/baseModel';

export const platforms = [
  'web',
  'ios',
  'android',
  'mobile',
];

export const configTypes = [
  'text',
  'number',
  'boolean',
  'json',
];

export const schema = new mongoose.Schema({
  enabled: {
    $type: Boolean, default: true,
  },
  name: {
    $type: String, required: true, // Human readable name for admin
  },
  key: {
    $type: String,
    required: true,
    unique: true,
    index: true,
    validate: [v => validator.isAlphanumeric(v), 'Key must be alphanumeric'],
  },
  description: {
    $type: String, required: false,
  },
  group: {
    $type: String, required: false,
  },
  type: {
    $type: String, enum: configTypes, required: true,
  },
  defaultValue: {
    $type: mongoose.Schema.Types.Mixed, required: true,
  },
  values: [
    {
      platform: {
        $type: String, enum: platforms, required: true,
      },
      value: {
        $type: mongoose.Schema.Types.Mixed, required: true,
      },
    },
  ],
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  typeKey: '$type', // So that we can use fields named `type`
});

schema.plugin(baseModel, {
  timestamps: true,
});

export const model = mongoose.model('ClientConfigOption', schema);
