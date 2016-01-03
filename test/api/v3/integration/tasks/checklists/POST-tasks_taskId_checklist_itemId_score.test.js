import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /tasks/:taskId/checklist/:itemId/score', () => {
  let user;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
    });
  });

  it('scores a checklist item', () => {
    let task;

    return user.post('/tasks', {
      type: 'daily',
      text: 'Daily with checklist',
    }).then(createdTask => {
      task = createdTask;
      return user.post(`/tasks/${task._id}/checklist`, {text: 'Checklist Item 1', completed: false});
    }).then((savedTask) => {
      return user.post(`/tasks/${task._id}/checklist/${savedTask.checklist[0]._id}/score`);
    }).then((savedTask) => {
      expect(savedTask.checklist.length).to.equal(1);
      expect(savedTask.checklist[0].completed).to.equal(true);
    });
  });

  it('fails on habits', () => {
    let habit;
    return expect(user.post('/tasks', {
      type: 'habit',
      text: 'habit with checklist',
    }).then(createdTask => {
      habit = createdTask;
      return user.post(`/tasks/${habit._id}/checklist/${generateUUID()}/score`, {text: 'Checklist Item 1'});
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('fails on rewards', async () => {
    let reward = await user.post('/tasks', {
      type: 'reward',
      text: 'reward with checklist',
    });

    await expect(user.post(`/tasks/${reward._id}/checklist/${generateUUID()}/score`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('fails on task not found', () => {
    return expect(user.post(`/tasks/${generateUUID()}/checklist/${generateUUID()}/score`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });
  });

  it('fails on checklist item not found', () => {
    return expect(user.post('/tasks', {
      type: 'daily',
      text: 'daily with checklist',
    }).then(createdTask => {
      return user.post(`/tasks/${createdTask._id}/checklist/${generateUUID()}/score`);
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('checklistItemNotFound'),
    });
  });
});
