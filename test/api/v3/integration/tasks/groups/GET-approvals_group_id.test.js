import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import { find } from 'lodash';

describe('GET /approvals/group/:groupId', () => {
  let user, guild, member, task, syncedTask;

  function findAssignedTask (memberTask) {
    return memberTask.group.id === guild._id;
  }

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
      text: 'test todo',
      type: 'todo',
      requiresApproval: true,
    });

    await user.post(`/tasks/${task._id}/assign/${member._id}`);

    let memberTasks = await member.get('/tasks/user');
    syncedTask = find(memberTasks, findAssignedTask);

    try {
      await member.post(`/tasks/${syncedTask._id}/score/up`);
    } catch (e) {
      // eslint-disable-next-line no-empty
    }
  });

  it('errors when user is not the group leader', async () => {
    await expect(member.get(`/approvals/group/${guild._id}`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyGroupLeaderCanEditTasks'),
      });
  });

  it('gets a list of task that need approval', async () => {
    let approvals = await user.get(`/approvals/group/${guild._id}`);
    expect(approvals[0]._id).to.equal(syncedTask._id);
  });

  it('allows managers to get a list of task that need approval', async () => {
    await user.post(`/groups/${guild._id}/add-manager`, {
      managerId: member._id,
    });

    let approvals = await member.get(`/approvals/group/${guild._id}`);
    expect(approvals[0]._id).to.equal(syncedTask._id);
  });
});
