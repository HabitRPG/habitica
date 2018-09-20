import { v4 as uuid } from 'uuid';
import validator from 'validator';
import _ from 'lodash';

module.exports = function baseModel (schema, options = {}) {
  if (options._id !== false) {
    schema.add({
      _id: {
        type: String,
        default: uuid,
        validate: [validator.isUUID, 'Invalid uuid.'],
      },
    });
  }

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

    schema.pre('update', function preUpdateModel () {
      this.update({}, { $set: { updatedAt: new Date() } });
    });
  }

  let noSetFields = ['createdAt', 'updatedAt'];
  let privateFields = ['__v'];

  if (Array.isArray(options.noSet)) noSetFields.push(...options.noSet);
  // This method accepts an additional array of fields to be sanitized that can be passed at runtime
  schema.statics.sanitize = function sanitize (objToSanitize = {}, additionalFields = []) {
    noSetFields.concat(additionalFields).forEach((fieldPath) => {
      _.unset(objToSanitize, fieldPath);
    });

    // Allow a sanitize transform function to be used
    return options.sanitizeTransform ? options.sanitizeTransform(objToSanitize) : objToSanitize;
  };

  if (Array.isArray(options.private)) privateFields.push(...options.private);

  if (!schema.options.toJSON) schema.options.toJSON = {};
  schema.options.toJSON.transform = function transformToObject (doc, plainObj) {
    privateFields.forEach((fieldPath) => {
      _.unset(plainObj, fieldPath);
    });

    // Always return `id`
    if (!plainObj.id && plainObj._id) plainObj.id = plainObj._id;

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
};
