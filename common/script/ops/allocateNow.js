import _ from 'lodash';

module.exports = function(user, req, cb) {
  _.times(user.stats.points, user.fns.autoAllocate);
  user.stats.points = 0;
  if (typeof user.markModified === "function") {
    user.markModified('stats');
  }
  return typeof cb === "function" ? cb(null, user.stats) : void 0;
};
