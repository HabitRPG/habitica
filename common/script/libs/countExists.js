import _ from 'lodash';

module.exports = function(items) {
  return _.reduce(items, (function(m, v) {
    return m + (v ? 1 : 0);
  }), 0);
};
