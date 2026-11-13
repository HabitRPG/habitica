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
  'email',
  'url',
  'date',
];

function sanitizeJsonValue (value) {
  if (typeof value !== 'string') return value === undefined ? null : JSON.stringify(value, null, 2);
  try {
    JSON.parse(value);
    return value;
  } catch (e) {
    return null;
  }
}

export function minifyJsonValue (value) {
  if (typeof value !== 'string') return JSON.stringify(value);
  try {
    return JSON.stringify(JSON.parse(value));
  } catch (e) {
    return value;
  }
}

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
  // Overrides of the default value. Each one targets a platform, a segment or both.
  values: {
    $type: [
      {
        platform: {
          $type: String, enum: platforms, required: false,
        },
        segment: {
          $type: String, ref: 'ClientConfigSegment', required: false,
        },
        value: {
          $type: mongoose.Schema.Types.Mixed, required: true,
        },
      },
    ],
    validate: [
      v => v.every(override => override.platform || override.segment),
      'Values must target a platform or a segment',
    ],
  },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  typeKey: '$type', // So that we can use fields named `type`
});

schema.plugin(baseModel, {
  timestamps: true,
  sanitizeTransform (option) {
    const { type } = option;
    if (Array.isArray(option.values)) {
      option.values.forEach(v => {
        if (!v.platform) delete v.platform;
        if (!v.segment) delete v.segment;
      });
    }
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
      // Stored as the raw string so formatting is preserved for editing
      option.defaultValue = sanitizeJsonValue(option.defaultValue);
      if (Array.isArray(option.values)) {
        option.values = option.values.map(v => ({ ...v, value: sanitizeJsonValue(v.value) }));
      }
    }
    return option;
  },
});

export const model = mongoose.model('ClientConfigOption', schema);
