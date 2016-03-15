import _ from 'lodash';
/*
Because the same op needs to be performed on the client and the server (critical hits, item drops, etc),
we need things to be "random", but technically predictable so that they don't go out-of-sync
 */

module.exports = function(user, seed) {
  var x;
  if (!seed || seed === Math.PI) {
    seed = _.reduce(user.stats, (function(m, v) {
      if (_.isNumber(v)) {
        return m + v;
      } else {
        return m;
      }
    }), 0);
  }
  x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};
