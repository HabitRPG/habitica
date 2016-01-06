import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('DELETE /tasks/:taskId/tags/:tagId', () => {
  let user;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
    });
  });

  it('removes a tag from a task', () => {
    let tag;
    let task;

    return user.post('/tasks/user', {
      type: 'habit',
      text: 'Task with tag',
    }).then(createdTask => {
      task = createdTask;
      return user.post('/tags', {name: 'Tag 1'});
    }).then(createdTag => {
      tag = createdTag;
      return user.post(`/tasks/${task._id}/tags/${tag._id}`);
    }).then(() => {
      return user.del(`/tasks/${task._id}/tags/${tag._id}`);
    }).then(() => user.get(`/tasks/${task._id}`))
    .then(updatedTask => {
      expect(updatedTask.tags.length).to.equal(0);
    });
  });

  it('only deletes existing tags', () => {
    return expect(user.post('/tasks/user', {
      type: 'habit',
      text: 'Task with tag',
    }).then(createdTask => {
      return user.del(`/tasks/${createdTask._id}/tags/${generateUUID()}`);
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('tagNotFound'),
    });
  });
});
