import _ from 'lodash';

// TODO move to client since it's only used there?
// TODO rename file to clearCompletedTodos

module.exports = function clearCompletedTodos (todos) {
  _.remove(todos, todo => {
    return todo.completed && (!todo.challenge || !todo.challenge.id || todo.challenge.broken);
  });
};
