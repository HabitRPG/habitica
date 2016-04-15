import {
  generateUser,
} from '../../../../helpers/api-integration/v2';

describe('POST /user/tasks/clear-completed', () => {
  let user;

  beforeEach(async () => {
    return generateUser().then((_user) => {
      user = _user;
    });
  });

  it('removes all completed todos', async () => {
    let toComplete = await user.post('/user/tasks', {
      type: 'todo',
      text: 'done',
    });

    await user.post(`/user/tasks/${toComplete._id}/up`);

    let todos = await user.get('/user/tasks?type=todo');
    let uncomplete = await user.post('/user/tasks/clear-completed');
    expect(todos.length).to.equal(uncomplete.length + 1);
  });
});
