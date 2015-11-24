import _ from 'lodash';
import { uuid } from '../../../../common';
import validator from 'validator';

export default function baseModel (schema, options = {}) {
  schema.add({
    _id: {
      type: String,
      default: uuid.v4,
      validate: [validator.isUUID, 'Invalid uuid.'], // TODO check for UUID version
    },
  });

  if (options.timestamps) {
    schema.add({
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    });
  }

  if (options.timestamps) {
    schema.pre('save', function updateUpdatedAt (next) {
      if (!this.isNew) this.updatedAt = Date.now();
      next();
    });
  }

  let noSetFields = ['createdAt', 'updatedAt'];
  let privateFields = ['__v'];

  if (Array.isArray(options.noSet)) noSetFields.push(...options.noSet);
  schema.statics.sanitize = function sanitize (objToSanitize = {}) {
    noSetFields.forEach((fieldPath) => {
      _.set(objToSanitize, fieldPath, undefined); // TODO decide wheter to use delete here
    });

    return objToSanitize;
  };

  if (Array.isArray(options.private)) privateFields.push(...options.private);
  if (!schema.options.toObject) schema.options.toObject = {};
  schema.options.toObject.transform = function transformToObject (doc, plainObj) {
    privateFields.forEach((fieldPath) => {
      _.set(plainObj, fieldPath, undefined); // TODO decide wheter to use delete here
    });
  };
}
