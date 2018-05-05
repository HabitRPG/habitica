import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';
// Currently we do not support adding tags to group original tasks, but if we do in the future, these tests will check
xdescribe('DELETE group /tasks/:taskId/tags/:tagId', () => {
  let user, guild, task;

  before(async () => {
    let {group, groupLeader} = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Guild',
        type: 'guild',
      },
      members: 2,
    });

    guild = group;
    user = groupLeader;
  });

  it('removes a tag from a task', async () => {
    task = await user.post(`/tasks/group/${guild._id}`, {
      type: 'habit',
      text: 'Task with tag',
    });

    let tag = await user.post('/tags', {name: 'Tag 1'});

    await user.post(`/tasks/${task._id}/tags/${tag.id}`);
    await user.del(`/tasks/${task._id}/tags/${tag.id}`);

    let updatedTask = await user.get(`/tasks/group/${guild._id}`);

    expect(updatedTask[0].tags.length).to.equal(0);
  });

  it('only deletes existing tags', async () => {
    let createdTask = await user.post(`/tasks/group/${guild._id}`, {
      type: 'habit',
      text: 'Task with tag',
    });

    await expect(user.del(`/tasks/${createdTask._id}/tags/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('tagNotFound'),
    });
  });
});
