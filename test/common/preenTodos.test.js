import moment from 'moment';
import { generateTodo } from '../helpers/common.helper';
import { preenTodos } from '../../common/script/index.js';

describe('#preenTodos', () => {
  let todos, uncompletedTodo, completedChallengeTodo, newlyCompletedTodo, completedTodoFromTwoDaysAgo, completedTodoFromThreeDaysAgo, completedTodoFromTenDaysAgo;

  beforeEach(() => {
    uncompletedTodo = generateTodo({ completed: false });
    completedChallengeTodo = generateTodo({
      completed: true,
      challenge: { id: 'some-challenge' },
    });
    newlyCompletedTodo = generateTodo({
      completed: true,
      dateCompleted: moment(),
    });
    completedTodoFromTwoDaysAgo = generateTodo({
      completed: true,
      dateCompleted: moment().subtract({ days: 2 }),
    });
    completedTodoFromThreeDaysAgo = generateTodo({
      completed: true,
      dateCompleted: moment().subtract({ days: 3 }),
    });
    completedTodoFromTenDaysAgo = generateTodo({
      completed: true,
      dateCompleted: moment().subtract({ days: 10 }),
    });

    todos = [
      uncompletedTodo,
      completedChallengeTodo,
      newlyCompletedTodo,
      completedTodoFromTwoDaysAgo,
      completedTodoFromThreeDaysAgo,
      completedTodoFromTenDaysAgo,
    ];
  });

  it('includes uncompleted todos', () => {
    let preenedTodos = preenTodos(todos);

    expect(preenedTodos).to.include(uncompletedTodo);
  });

  it('includes completed challenge todos', () => {
    let preenedTodos = preenTodos(todos);

    expect(preenedTodos).to.include(completedChallengeTodo);
  });

  it('includes recently completed todos', () => {
    let preenedTodos = preenTodos(todos);

    expect(preenedTodos).to.include(newlyCompletedTodo);
  });

  it('includes todos completed two days ago', () => {
    let preenedTodos = preenTodos(todos);

    expect(preenedTodos).to.include(completedTodoFromTwoDaysAgo);
  });

  it('does not include todos completed three days ago', () => {
    let preenedTodos = preenTodos(todos);

    expect(preenedTodos).to.not.include(completedTodoFromThreeDaysAgo);
  });

  it('does not include todos completed more than three days ago', () => {
    let preenedTodos = preenTodos(todos);

    expect(preenedTodos).to.not.include(completedTodoFromTenDaysAgo);
  });
});
