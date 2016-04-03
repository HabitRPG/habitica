// An utility to pick deep properties from an object.
// Works like _.pick but supports nested props (ie pickDeep(obj, ['deep.property']))

import _ from 'lodash';

module.exports = function pickDeep (obj, properties) {
  if (!_.isArray(properties)) throw new Error('"properties" must be an array');

  let result = {};
  _.each(properties, (prop) => _.set(result, prop, _.get(obj, prop)));

  return result;
};
