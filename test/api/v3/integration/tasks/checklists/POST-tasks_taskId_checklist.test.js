import {
  generateUser,
  requester,
  translate as t,
} from '../../../../../helpers/api-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /tasks/:taskId/checklist/', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  it('adds a checklist item to a task', () => {
    let task;

    return api.post('/tasks', {
      type: 'daily',
      text: 'Daily with checklist',
    }).then(createdTask => {
      task = createdTask;
      return api.post(`/tasks/${task._id}/checklist`, {text: 'Checklist Item 1', ignored: false, _id: 123});
    }).then((savedTask) => {
      expect(savedTask.checklist.length).to.equal(1);
      expect(savedTask.checklist[0].text).to.equal('Checklist Item 1');
      expect(savedTask.checklist[0].completed).to.equal(false);
      expect(savedTask.checklist[0]._id).to.be.a('string');
      expect(savedTask.checklist[0]._id).to.not.equal('123');
      expect(savedTask.checklist[0].ignored).to.be.an('undefined');
    });
  });

  it('does not add a checklist to habits', () => {
    let habit;
    return expect(api.post('/tasks', {
      type: 'habit',
      text: 'habit with checklist',
    }).then(createdTask => {
      habit = createdTask;
      return api.post(`/tasks/${habit._id}/checklist`, {text: 'Checklist Item 1'});
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('does not add a checklist to rewards', () => {
    let reward;
    return expect(api.post('/tasks', {
      type: 'reward',
      text: 'reward with checklist',
    }).then(createdTask => {
      reward = createdTask;
      return api.post(`/tasks/${reward._id}/checklist`, {text: 'Checklist Item 1'});
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('fails on task not found', () => {
    return expect(api.post(`/tasks/${generateUUID()}/checklist`, {
      text: 'Checklist Item 1'
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });
  });
});
