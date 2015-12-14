import {
  generateUser,
  requester,
  translate as t,
} from '../../../../../helpers/api-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /tasks/:taskId/tags/:tagId', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  it('adds a tag to a task', () => {
    let tag;
    let task;

    return api.post('/tasks', {
      type: 'habit',
      text: 'Task with tag',
    }).then(createdTask => {
      task = createdTask;
      return api.post('/tags', {name: 'Tag 1'});
    }).then(createdTag => {
      tag = createdTag;
      return api.post(`/tasks/${task._id}/tags/${tag._id}`);
    }).then(savedTask => {
      expect(savedTask.tags[0]).to.equal(tag._id);
    });
  });

  it('does not add a tag to a task twice', () => {
    let tag;
    let task;

    return expect(api.post('/tasks', {
      type: 'habit',
      text: 'Task with tag',
    }).then(createdTask => {
      task = createdTask;
      return api.post('/tags', {name: 'Tag 1'});
    }).then(createdTag => {
      tag = createdTag;
      return api.post(`/tasks/${task._id}/tags/${tag._id}`);
    }).then(() => {
      return api.post(`/tasks/${task._id}/tags/${tag._id}`);
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('alreadyTagged'),
    });
  });

  it('does not add a non existing tag to a task', () => {
    return expect(api.post('/tasks', {
      type: 'habit',
      text: 'Task with tag',
    }).then((task) => {
      return api.post(`/tasks/${task._id}/tags/${generateUUID()}`);
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });
});
