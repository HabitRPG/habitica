import {
  generateUser,
  generateGroup,
} from '../../../../../helpers/api-v3-integration.helper';

describe('POST group-tasks/:taskId/move/to/:position', () => {
  let user, guild;

  beforeEach(async () => {
    user = await generateUser({balance: 1});
    guild = await generateGroup(user, {type: 'guild'});
  });

  it('can move task to new position', async () => {
    let tasks = await user.post(`/tasks/group/${guild._id}`, [
      {type: 'habit', text: 'habit 1'},
      {type: 'habit', text: 'habit 2'},
      {type: 'daily', text: 'daily 1'},
      {type: 'habit', text: 'habit 3'},
      {type: 'habit', text: 'habit 4'},
      {type: 'todo', text: 'todo 1'},
      {type: 'habit', text: 'habit 5'},
    ]);

    let taskToMove = tasks[1];
    expect(taskToMove.text).to.equal('habit 2');
    let newOrder = await user.post(`/group-tasks/${tasks[1]._id}/move/to/3`);
    expect(newOrder[3]).to.equal(taskToMove._id);
    expect(newOrder.length).to.equal(5);
  });

  it('can push to bottom', async () => {
    let tasks = await user.post(`/tasks/group/${guild._id}`, [
      {type: 'habit', text: 'habit 1'},
      {type: 'habit', text: 'habit 2'},
      {type: 'daily', text: 'daily 1'},
      {type: 'habit', text: 'habit 3'},
      {type: 'habit', text: 'habit 4'},
      {type: 'todo', text: 'todo 1'},
      {type: 'habit', text: 'habit 5'},
    ]);

    let taskToMove = tasks[1];
    expect(taskToMove.text).to.equal('habit 2');
    let newOrder = await user.post(`/group-tasks/${tasks[1]._id}/move/to/-1`);
    expect(newOrder[4]).to.equal(taskToMove._id);
    expect(newOrder.length).to.equal(5);
  });
});
