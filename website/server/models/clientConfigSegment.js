import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';
import {
  MAX_CONDITIONS,
  coerceConditionValue,
  isValidCondition,
} from '../libs/clientConfigTargeting';

export const schema = new mongoose.Schema({
  name: {
    $type: String, required: true, // Human readable name for admin
  },
  description: {
    $type: String, required: false,
  },
  color: {
    $type: String, required: false,
  },
  // All conditions must match for a user to be part of the segment
  conditions: {
    $type: [
      {
        _id: false,
        attribute: { $type: String, required: true },
        operator: { $type: String, required: true },
        value: { $type: mongoose.Schema.Types.Mixed },
      },
    ],
    validate: [
      {
        validator: v => v.length <= MAX_CONDITIONS,
        message: `A segment can have at most ${MAX_CONDITIONS} conditions`,
      },
      {
        validator: v => v.every(condition => isValidCondition(condition)),
        message: 'Invalid segment condition',
      },
    ],
  },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  typeKey: '$type', // So that we can use fields named `type`
});

schema.plugin(baseModel, {
  timestamps: true,
  sanitizeTransform (segment) {
    if (Array.isArray(segment.conditions)) {
      segment.conditions = segment.conditions.map(({ attribute, operator, value }) => ({
        attribute,
        operator,
        value: coerceConditionValue(attribute, operator, value),
      }));
    }
    return segment;
  },
});

export const model = mongoose.model('ClientConfigSegment', schema);
