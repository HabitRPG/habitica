import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';

const { Schema } = mongoose;

export const schema = new Schema({
  regId: { $type: String, required: true },
  type: { $type: String, required: true, enum: ['ios', 'android'] },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  _id: false,
  typeKey: '$type', // So that we can use a field named `type`
});

schema.plugin(baseModel, {
  noSet: ['_id', 'regId'],
  timestamps: true,
  _id: false,
});

/**
 * Convert notifications to JSON making sure to return only valid data.
 * Fix for https://github.com/HabitRPG/habitica/issues/11868
 * Based on similar fix for Notifications
 */
schema.statics.convertPushDevicesToSafeJson = function convPushDevsToSafeJson (pushDevices) {
  if (!pushDevices) return pushDevices;

  let filteredPushDevices = pushDevices.filter(n => {
    // Exclude push devices with a nullish value
    if (!n) return false;
    // Exclude invalid push devices
    if (n.validateSync()) return false;
    return true;
  });

  return filteredPushDevices.map(n => n.toJSON());
};


export const model = mongoose.model('PushDevice', schema);
