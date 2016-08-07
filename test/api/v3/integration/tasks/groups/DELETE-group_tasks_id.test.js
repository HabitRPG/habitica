import {
  translate as t,
  createAndPopulateGroup,
} from '../../../../../helpers/api-integration/v3';
import { find } from 'lodash';

describe('DELETE /tasks/:id', () => {
  let user, guild, member, task;

  beforeEach(async () => {
    let {group, members, groupLeader} = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Guild',
        type: 'guild',
      },
      members: 1,
    });

    guild = group;
    user = groupLeader;
    member = members[0];

    task = await user.post(`/tasks/group/${guild._id}`, {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    });

    await user.post(`/tasks/${task._id}/assign/${member._id}`);
  });

  it('deletes a group task', async () => {
    await user.del(`/tasks/${task._id}`);

    await expect(user.get(`/tasks/${task._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
  });

  it('unlinks assignee', async () => {
    await user.del(`/tasks/${task._id}`);

    let memberTasks = await member.get('/tasks/user');

    let syncedTask = find(memberTasks, function findAssignedTask (memberTask) {
      return memberTask.assignedUserId === member._id;
    });

    expect(syncedTask.group.broken).to.equal('TASK_DELETED');
  });
});
