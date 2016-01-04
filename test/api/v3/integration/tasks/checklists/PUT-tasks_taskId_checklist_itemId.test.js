import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('PUT /tasks/:taskId/checklist/:itemId', () => {
  let user;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
    });
  });

  it('updates a checklist item', () => {
    let task;

    return user.post('/tasks?tasksOwner=user', {
      type: 'daily',
      text: 'Daily with checklist',
    }).then(createdTask => {
      task = createdTask;
      return user.post(`/tasks/${task._id}/checklist`, {text: 'Checklist Item 1', completed: false});
    }).then((savedTask) => {
      return user.put(`/tasks/${task._id}/checklist/${savedTask.checklist[0]._id}`, {text: 'updated', completed: true, _id: 123});
    }).then((savedTask) => {
      expect(savedTask.checklist.length).to.equal(1);
      expect(savedTask.checklist[0].text).to.equal('updated');
      expect(savedTask.checklist[0].completed).to.equal(true);
      expect(savedTask.checklist[0]._id).to.not.equal('123');
    });
  });

  it('fails on habits', async () => {
    let habit = await user.post('/tasks?tasksOwner=user', {
      type: 'habit',
      text: 'habit with checklist',
    });

    await expect(user.put(`/tasks/${habit._id}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('fails on rewards', async () => {
    let reward = await user.post('/tasks?tasksOwner=user', {
      type: 'reward',
      text: 'reward with checklist',
    });

    await expect(user.put(`/tasks/${reward._id}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('fails on task not found', () => {
    return expect(user.put(`/tasks/${generateUUID()}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });
  });

  it('fails on checklist item not found', () => {
    return expect(user.post('/tasks?tasksOwner=user', {
      type: 'daily',
      text: 'daily with checklist',
    }).then(createdTask => {
      return user.put(`/tasks/${createdTask._id}/checklist/${generateUUID()}`);
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('checklistItemNotFound'),
    });
  });
});
