import {
  generateUser,
  requester,
  translate as t,
} from '../../../../../helpers/api-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('DELETE /tasks/:taskId/checklist/:itemId', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  it('deletes a checklist item', () => {
    let task;

    return api.post('/tasks', {
      type: 'daily',
      text: 'Daily with checklist',
    }).then(createdTask => {
      task = createdTask;
      return api.post(`/tasks/${task._id}/checklist`, {text: 'Checklist Item 1', completed: false});
    }).then((savedTask) => {
      return api.del(`/tasks/${task._id}/checklist/${savedTask.checklist[0]._id}`);
    }).then(() => {
      return api.get(`/tasks/${task._id}`);
    }).then((savedTask) => {
      expect(savedTask.checklist.length).to.equal(0);
    });
  });

  it('does not work with habits', () => {
    let habit;
    return expect(api.post('/tasks', {
      type: 'habit',
      text: 'habit with checklist',
    }).then(createdTask => {
      habit = createdTask;
      return api.del(`/tasks/${habit._id}/checklist/${generateUUID()}`);
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('does not work with rewards', () => {
    let reward;
    return expect(api.post('/tasks', {
      type: 'reward',
      text: 'reward with checklist',
    }).then(createdTask => {
      reward = createdTask;
      return api.del(`/tasks/${reward._id}/checklist/${generateUUID()}`);
    }).then(checklistItem => {})).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('fails on task not found', () => {
    return expect(api.del(`/tasks/${generateUUID()}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });
  });

  it('fails on checklist item not found', () => {
    return expect(api.post('/tasks', {
      type: 'daily',
      text: 'daily with checklist',
    }).then(createdTask => {
      return api.del(`/tasks/${createdTask._id}/checklist/${generateUUID()}`);
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('checklistItemNotFound'),
    });
  });
});
