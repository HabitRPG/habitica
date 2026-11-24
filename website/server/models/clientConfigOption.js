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

// Form values can arrive as strings, where Boolean("false") would be true
const parseBoolean = value => value === true || value === 'true';
const parseNumber = value => {
  if (value === '' || value === null || value === undefined) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

export function minifyJsonValue (value) {
  if (typeof value !== 'string') return JSON.stringify(value);
  try {
    return JSON.stringify(JSON.parse(value));
  } catch (e) {
    return value;
  }
}

function isValidUrl (value) {
  try {
    return Boolean(new URL(value));
  } catch (e) {
    return false;
  }
}

// Blank strings are allowed for string types, clients fall back to their own default
const VALUE_CHECKS = {
  text: v => typeof v === 'string',
  number: v => typeof v === 'number' && Number.isFinite(v),
  boolean: v => typeof v === 'boolean',
  json: v => typeof v === 'string',
  email: v => v === '' || (typeof v === 'string' && validator.isEmail(v)),
  url: v => v === '' || (typeof v === 'string' && isValidUrl(v)),
  date: v => v === '' || (typeof v === 'string' && validator.isISO8601(v)),
};

export function isValidConfigValue (type, value) {
  const check = VALUE_CHECKS[type];
  return !check || check(value); // unknown types are rejected by the `type` enum
}

const valueMatchesType = {
  validator (value) {
    const option = typeof this.ownerDocument === 'function' && this.ownerDocument() !== this
      ? this.ownerDocument() : this;
    return isValidConfigValue(option.type, value);
  },
  message: props => `Value "${props.value}" doesn't match the config type`,
};

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
    $type: mongoose.Schema.Types.Mixed, required: true, validate: valueMatchesType,
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
          $type: mongoose.Schema.Types.Mixed, required: true, validate: valueMatchesType,
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
  noSet: ['_id'],
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
      option.defaultValue = parseNumber(option.defaultValue);
      if (Array.isArray(option.values)) {
        option.values.forEach(v => {
          v.value = parseNumber(v.value);
        });
      }
    } else if (type === 'boolean') {
      option.defaultValue = parseBoolean(option.defaultValue);
      if (Array.isArray(option.values)) {
        option.values.forEach(v => {
          v.value = parseBoolean(v.value);
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
