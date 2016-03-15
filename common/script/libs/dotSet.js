import _ from 'lodash';

module.exports = function(obj, path, val) {
  var arr;
  arr = path.split('.');
  return _.reduce(arr, (function(_this) {
    return function(curr, next, index) {
      if ((arr.length - 1) === index) {
        curr[next] = val;
      }
      return curr[next] != null ? curr[next] : curr[next] = {};
    };
  })(this), obj);
};
