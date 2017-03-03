import forOwn from 'lodash/forOwn';

module.exports = function prefillAppearances (obj) {
  forOwn(obj, function prefillAppearance (value, key) {
    value.key = key;
    if (!value.price) {
      value.price = 0;
    }
  });
  return obj;
};
