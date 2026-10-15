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
  sanitizeTransform (option) {
    const { type } = option;
    if (type === 'number') {
      option.defaultValue = Number(option.defaultValue);
      if (Array.isArray(option.values)) {
        option.values.forEach(v => {
          v.value = Number(v.value);
        });
      }
    } else if (type === 'boolean') {
      option.defaultValue = Boolean(option.defaultValue);
      if (Array.isArray(option.values)) {
        option.values.forEach(v => {
          v.value = Boolean(v.value);
        });
      }
    } else if (type === 'json') {
      try {
        option.defaultValue = JSON.parse(option.defaultValue);
      } catch (e) {
        option.defaultValue = null;
      }
      if (Array.isArray(option.values)) {
        option.values = option.values.map(v => {
          try {
            return { ...v, value: JSON.parse(v.value) };
          } catch (e) {
            return { ...v, value: null };
          }
        });
      }
    }
    return option;
  },
});

export const model = mongoose.model('ClientConfigOption', schema);
