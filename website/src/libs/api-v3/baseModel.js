import { uuid } from '../../../../common';
import validator from 'validator';
import objectPath from 'object-path'; // TODO use lodash's unset once v4 is out
import { get, findIndex } from 'lodash';

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
  // This method accepts an additional array of fields to be sanitized that can be passed at runtime
  schema.statics.sanitize = function sanitize (objToSanitize = {}, additionalFields = []) {
    noSetFields.concat(additionalFields).forEach((fieldPath) => {
      objectPath.del(objToSanitize, fieldPath);
    });

    // Allow a sanitize transform function to be used
    return options.sanitizeTransform ? options.sanitizeTransform(objToSanitize) : objToSanitize;
  };

  schema.methods.removeFromArray = function removeFromArray (arrayPath, item) {
    let doc = this;
    let itemIndex;
    let array = get(doc, arrayPath);

    if (typeof item === 'object') {
      itemIndex = findIndex(array, item);
    } else {
      itemIndex = array.indexOf(item);
    }

    if (itemIndex !== -1) {
      array.splice(itemIndex, 1);
      return array;
    }

    return false;
  };

  if (!schema.options.toJSON) schema.options.toJSON = {};
  if (Array.isArray(options.private)) privateFields.push(...options.private);
  schema.options.toJSON.transform = function transformToObject (doc, plainObj) {
    privateFields.forEach((fieldPath) => {
      objectPath.del(plainObj, fieldPath);
    });

    // Allow an additional toJSON transform function to be used
    return options.toJSONTransform ? options.toJSONTransform(plainObj) : plainObj;
  };
}
