import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('POST /tasks/:taskId/move/to/:position', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('requires a numeric position parameter', async () => {
    await expect(user.post(`/tasks/${generateUUID()}/move/to/notANumber`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('taskId must match a valid task', async () => {
    await expect(user.post(`/tasks/${generateUUID()}/move/to/1`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });
  });

  it('can move task to new position', async () => {
    let tasks = await user.post('/tasks/user', [
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

    let newOrder = await user.post(`/tasks/${tasks[1]._id}/move/to/3`);
    await user.sync();

    expect(newOrder[3]).to.equal(taskToMove._id);
    expect(newOrder.length).to.equal(5);
    expect(user.tasksOrder.habits).to.eql(newOrder);
  });

  it('can move task to new position using alias', async () => {
    let tasks = await user.post('/tasks/user', [
      {type: 'habit', text: 'habit 1'},
      {type: 'habit', text: 'habit 2', alias: 'move'},
      {type: 'daily', text: 'daily 1'},
      {type: 'habit', text: 'habit 3'},
      {type: 'habit', text: 'habit 4'},
      {type: 'todo', text: 'todo 1'},
      {type: 'habit', text: 'habit 5'},
    ]);

    let taskToMove = tasks[1];
    expect(taskToMove.text).to.equal('habit 2');
    let newOrder = await user.post(`/tasks/${taskToMove.alias}/move/to/3`);
    expect(newOrder[3]).to.equal(taskToMove._id);
    expect(newOrder.length).to.equal(5);
  });

  it('can\'t move completed todo', async () => {
    let task = await user.post('/tasks/user', {type: 'todo', text: 'todo 1'});
    await user.post(`/tasks/${task._id}/score/up`);

    await expect(user.post(`/tasks/${task._id}/move/to/1`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('cantMoveCompletedTodo'),
    });
  });

  it('can push to bottom', async () => {
    let tasks = await user.post('/tasks/user', [
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
    let newOrder = await user.post(`/tasks/${tasks[1]._id}/move/to/-1`);
    expect(newOrder[4]).to.equal(taskToMove._id);
    expect(newOrder.length).to.equal(5);
  });
});
