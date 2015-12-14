import {
  generateUser,
  requester,
  translate as t,
} from '../../../../../helpers/api-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('DELETE /tasks/:taskId/tags/:tagId', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  it('removes a tag from a task', () => {
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
      return api.del(`/tasks/${task._id}/tags/${tag._id}`);
    }).then(() => api.get(`/tasks/${task._id}`))
    .then(updatedTask => {
      expect(updatedTask.tags.length).to.equal(0);
    });
  });

  it('only deletes existing tags', () => {
    let task;

    return expect(api.post('/tasks', {
      type: 'habit',
      text: 'Task with tag',
    }).then(createdTask => {
      return api.del(`/tasks/${createdTask._id}/tags/${generateUUID()}`);
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('tagNotFound'),
    });
  });
});
