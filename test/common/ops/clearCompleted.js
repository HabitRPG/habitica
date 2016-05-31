import clearCompleted from '../../../common/script/ops/clearCompleted';
import {
  generateTodo,
} from '../../helpers/common.helper';

describe('shared.ops.clearCompleted', () => {
  it('clear completed todos', () => {
    let todos = [
      generateTodo({text: 'todo'}),
      generateTodo({
        text: 'done',
        completed: true,
      }),
      generateTodo({
        text: 'done chellenge broken',
        completed: true,
        challenge: {
          id: 123,
          broken: 'TASK_DELETED',
        },
      }),
      generateTodo({
        text: 'done chellenge not broken',
        completed: true,
        challenge: {
          id: 123,
        },
      }),
    ];

    clearCompleted(todos);

    expect(todos.length).to.equal(2);
    expect(todos[0].text).to.equal('todo');
    expect(todos[1].text).to.equal('done chellenge not broken');
  });
});
