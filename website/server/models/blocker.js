/* eslint-disable camelcase */

import mongoose from 'mongoose';
import EventEmitter from 'events';
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

schema.statics.watchBlockers = function watchBlockers (query, options) {
  const emitter = new EventEmitter();
  const matchQuery = {
    $match: {},
  };
  if (query) {
    if (query.type) {
      matchQuery.$match['fullDocument.type'] = query.type;
    }
    if (query.area) {
      matchQuery.$match['fullDocument.area'] = query.area;
    }
  }
  process.nextTick(() => {
    this.watch([matchQuery], {
      fullDocument: 'updateLookup',
    })
      .on('change', change => {
        if (!change.fullDocument) {
          return; // Ignore changes that don't have a fullDocument
        }
        if (change.operationType === 'insert' || !change.fullDocument.disabled) {
          emitter.emit('change', {
            operation: 'add',
            blocker: change.fullDocument,
          });
        } else if (change.operationType === 'update' && change.fullDocument.disabled) {
          emitter.emit('change', {
            operation: 'delete',
            blocker: change.fullDocument,
          });
        }
      })
      .on('error', error => {
        emitter.emit('error', error);
      });
    if (options.initial) {
      const initialQuery = {
        disabled: false,
        ...query,
      };
      this.find(initialQuery).then(docs => {
        for (const doc of docs) {
          emitter.emit('change', {
            operation: 'add',
            blocker: doc,
          });
        }
      }).catch(error => {
        emitter.emit('error', error);
      });
    }
  });
  return emitter;
};

export const model = mongoose.model('Blocker', schema);
