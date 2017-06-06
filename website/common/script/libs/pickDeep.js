// An utility to pick deep properties from an object.
// Works like _.pick but supports nested props (ie pickDeep(obj, ['deep.property']))

import each from 'lodash/each';
import set from 'lodash/set';
import get from 'lodash/get';

module.exports = function pickDeep (obj, properties) {
  if (!Array.isArray(properties)) throw new Error('"properties" must be an array');

  let result = {};
  each(properties, (prop) => set(result, prop, get(obj, prop)));

  return result;
};
