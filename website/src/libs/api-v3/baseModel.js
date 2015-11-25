import { uuid } from '../../../../common';
import validator from 'validator';
import objectPath from 'object-path'; // TODO use lodash's unset once v4 is out

export default function baseModel (schema, options = {}) {
  schema.add({
    _id: {
      type: String,
      default: uuid,
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
      objectPath.del(objToSanitize, fieldPath);
    });

    return objToSanitize;
  };

  if (!schema.options.toJSON) schema.options.toJSON = {};
  if (Array.isArray(options.private)) privateFields.push(...options.private);
  schema.options.toJSON.transform = function transformToObject (doc, plainObj) {
    privateFields.forEach((fieldPath) => {
      objectPath.del(plainObj, fieldPath);
    });
  };
}
