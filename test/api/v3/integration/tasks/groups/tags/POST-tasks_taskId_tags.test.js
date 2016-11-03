import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';
// Currently we do not support adding tags to group original tasks, but if we do in the future, these tests will check
xdescribe('POST group /tasks/:taskId/tags/:tagId', () => {
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

  it('adds a tag to a task', async () => {
    task = await user.post(`/tasks/group/${guild._id}`, {
      type: 'habit',
      text: 'Task with tag',
    });

    let tag = await user.post('/tags', {name: 'Tag 1'});
    let savedTask = await user.post(`/tasks/${task._id}/tags/${tag.id}`);

    expect(savedTask.tags[0]).to.equal(tag.id);
  });

  it('does not add a tag to a task twice', async () => {
    task = await user.post(`/tasks/group/${guild._id}`, {
      type: 'habit',
      text: 'Task with tag',
    });

    let tag = await user.post('/tags', {name: 'Tag 1'});

    await user.post(`/tasks/${task._id}/tags/${tag.id}`);

    await expect(user.post(`/tasks/${task._id}/tags/${tag.id}`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('alreadyTagged'),
    });
  });

  it('does not add a non existing tag to a task', async () => {
    task = await user.post(`/tasks/group/${guild._id}`, {
      type: 'habit',
      text: 'Task with tag',
    });

    await expect(user.post(`/tasks/${task._id}/tags/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });
});
