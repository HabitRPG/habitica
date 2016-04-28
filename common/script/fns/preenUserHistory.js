import _ from 'lodash';
import preenHistory from '../libs/preenHistory';

module.exports = function(user, minHistLen) {
  if (minHistLen == null) {
    minHistLen = 7;
  }
  _.each(user.habits.concat(user.dailys), function(task) {
    var ref;
    if (((ref = task.history) != null ? ref.length : void 0) > minHistLen) {
      task.history = preenHistory(task.history);
    }
    return true;
  });
  _.defaults(user.history, {
    todos: [],
    exp: []
  });
  if (user.history.exp.length > minHistLen) {
    user.history.exp = preenHistory(user.history.exp);
  }
  if (user.history.todos.length > minHistLen) {
    return user.history.todos = preenHistory(user.history.todos);
  }
};
