import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('POST /tasks/:taskId/checklist/', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('adds a checklist item to a task', async () => {
    let task = await user.post('/tasks/user', {
      type: 'daily',
      text: 'Daily with checklist',
    });

    let savedTask = await user.post(`/tasks/${task._id}/checklist`, {
      text: 'Checklist Item 1',
      ignored: false,
      _id: 123,
    });

    expect(savedTask.checklist.length).to.equal(1);
    expect(savedTask.checklist[0].text).to.equal('Checklist Item 1');
    expect(savedTask.checklist[0].completed).to.equal(false);
    expect(savedTask.checklist[0].id).to.be.a('string');
    expect(savedTask.checklist[0].id).to.not.equal('123');
    expect(savedTask.checklist[0].ignored).to.be.an('undefined');
  });

  it('can use a alias to add checklist', async () => {
    let task = await user.post('/tasks/user', {
      type: 'daily',
      text: 'Daily with checklist',
      alias: 'task-with-shortname',
    });

    let savedTask = await user.post(`/tasks/${task.alias}/checklist`, {
      text: 'Checklist Item 1',
      ignored: false,
      _id: 123,
    });

    expect(savedTask.checklist.length).to.equal(1);
    expect(savedTask.checklist[0].text).to.equal('Checklist Item 1');
    expect(savedTask.checklist[0].completed).to.equal(false);
    expect(savedTask.checklist[0].id).to.be.a('string');
    expect(savedTask.checklist[0].id).to.not.equal('123');
    expect(savedTask.checklist[0].ignored).to.be.an('undefined');
  });

  it('does not add a checklist to habits', async () => {
    let habit = await user.post('/tasks/user', {
      type: 'habit',
      text: 'habit with checklist',
    });

    await expect(user.post(`/tasks/${habit._id}/checklist`, {
      text: 'Checklist Item 1',
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('does not add a checklist to rewards', async () => {
    let reward = await user.post('/tasks/user', {
      type: 'reward',
      text: 'reward with checklist',
    });

    await expect(user.post(`/tasks/${reward._id}/checklist`, {
      text: 'Checklist Item 1',
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('fails on task not found', async () => {
    await expect(user.post(`/tasks/${generateUUID()}/checklist`, {
      text: 'Checklist Item 1',
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });
  });
});
