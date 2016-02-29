import { uuid } from '../../../../common';
import validator from 'validator';
import objectPath from 'object-path'; // TODO use lodash's unset once v4 is out
import _ from 'lodash';

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

  if (Array.isArray(options.private)) privateFields.push(...options.private);

  if (!schema.options.toJSON) schema.options.toJSON = {};
  schema.options.toJSON.transform = function transformToObject (doc, plainObj) {
    privateFields.forEach((fieldPath) => {
      objectPath.del(plainObj, fieldPath);
    });

    // Allow an additional toJSON transform function to be used
    return options.toJSONTransform ? options.toJSONTransform(plainObj, doc) : plainObj;
  };

  schema.statics.getModelPaths = function getModelPaths () {
    return _.reduce(this.schema.paths, (result, field, path) => {
      if (privateFields.indexOf(path) === -1) {
        result[path] = field.instance || 'Boolean';
      }

      return result;
    }, {});
  };
}
