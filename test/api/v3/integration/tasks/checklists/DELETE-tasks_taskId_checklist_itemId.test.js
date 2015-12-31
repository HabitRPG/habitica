import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('DELETE /tasks/:taskId/checklist/:itemId', () => {
  let user;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
    });
  });

  it('deletes a checklist item', () => {
    let task;

    return user.post('/tasks', {
      type: 'daily',
      text: 'Daily with checklist',
    }).then(createdTask => {
      task = createdTask;
      return user.post(`/tasks/${task._id}/checklist`, {text: 'Checklist Item 1', completed: false});
    }).then((savedTask) => {
      return user.del(`/tasks/${task._id}/checklist/${savedTask.checklist[0]._id}`);
    }).then(() => {
      return user.get(`/tasks/${task._id}`);
    }).then((savedTask) => {
      expect(savedTask.checklist.length).to.equal(0);
    });
  });

  it('does not work with habits', () => {
    let habit;
    return expect(user.post('/tasks', {
      type: 'habit',
      text: 'habit with checklist',
    }).then(createdTask => {
      habit = createdTask;
      return user.del(`/tasks/${habit._id}/checklist/${generateUUID()}`);
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('does not work with rewards', async () => {
    let reward = await user.post('/tasks', {
      type: 'reward',
      text: 'reward with checklist',
    });

    await expect(user.del(`/tasks/${reward._id}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('fails on task not found', () => {
    return expect(user.del(`/tasks/${generateUUID()}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
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
      return user.del(`/tasks/${createdTask._id}/checklist/${generateUUID()}`);
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('checklistItemNotFound'),
    });
  });
});
