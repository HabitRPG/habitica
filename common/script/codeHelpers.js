import _ from 'lodash';

export function $w (s) {
  return s.split(' ');
}

export function dotGet (obj, path) {
  return _.reduce(path.split('.'), ((function () {
    return function (curr, next) {
      return curr != null ? curr[next] : void 0;
    };
  })(this)), obj);
}

export function dotSet (obj, path, val) {
  let arr = path.split('.');

  return _.reduce(arr, (function () {
    return function (curr, next, index) {
      if (arr.length - 1 === index) {
        curr[next] = val;
      }
      return curr[next] != null ? curr[next] : curr[next] = {};
    };
  })(this), obj);
}
