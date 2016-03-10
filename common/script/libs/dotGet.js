import _ from 'lodash';

module.exports = function(obj, path) {
  return _.reduce(path.split('.'), ((function(_this) {
    return function(curr, next) {
      return curr != null ? curr[next] : void 0;
    };
  })(this)), obj);
};
