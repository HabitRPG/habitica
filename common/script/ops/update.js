import _ from 'lodash';

module.exports = function(user, req, cb) {
  _.each(req.body, function(v, k) {
    user.fns.dotSet(k, v);
    return true;
  });
  return typeof cb === "function" ? cb(null, user) : void 0;
};
