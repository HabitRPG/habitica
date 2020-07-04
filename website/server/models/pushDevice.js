import mongoose from 'mongoose';
import _ from 'lodash';
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
 * Remove invalid data from an array of push devices.
 * Fix for https://github.com/HabitRPG/habitica/issues/11805
 * and https://github.com/HabitRPG/habitica/issues/11868
 * Called by user's post init hook (models/user/hooks.js)
 */
schema.statics.cleanupCorruptData = function cleanupCorruptPushDevicesData (pushDevices) {
  if (!pushDevices) return pushDevices;

  let filteredPushDevices = pushDevices.filter(pushDevice => {
    // Exclude push devices with a nullish value, no id or no type
    if (!pushDevice || !pushDevice.regId || !pushDevice.type) return false;
    return true;
  });

  // Remove duplicate push devices
  // can be caused by a race condition when adding a new push device
  filteredPushDevices = _.uniqWith(filteredPushDevices, (val, otherVal) => {
    if (val.regId === otherVal.regId && val.type === otherVal.type) return true;
    return false;
  });

  return filteredPushDevices;
};

export const model = mongoose.model('PushDevice', schema);
