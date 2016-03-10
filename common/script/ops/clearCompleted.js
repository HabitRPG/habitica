import _ from 'lodash';

module.exports = function(user, req, cb) {
  _.remove(user.todos, function(t) {
    var ref;
    return t.completed && !((ref = t.challenge) != null ? ref.id : void 0);
  });
  if (typeof user.markModified === "function") {
    user.markModified('todos');
  }
  return typeof cb === "function" ? cb(null, user.todos) : void 0;
};
