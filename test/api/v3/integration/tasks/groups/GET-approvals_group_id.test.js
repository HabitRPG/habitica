import { find } from 'lodash';
import {
  createAndPopulateGroup,
} from '../../../../../helpers/api-integration/v3';

describe('GET /approvals/group/:groupId', () => {
  let user; let guild; let member; let addlMember; let task; let syncedTask; let
    addlSyncedTask;

  function findAssignedTask (memberTask) {
    return memberTask.group.id === guild._id;
  }

  beforeEach(async () => {
    const { group, members, groupLeader } = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Guild',
        type: 'guild',
      },
      members: 2,
    });

    guild = group;
    user = groupLeader;
    member = members[0]; // eslint-disable-line prefer-destructuring
    addlMember = members[1]; // eslint-disable-line prefer-destructuring

    task = await user.post(`/tasks/group/${guild._id}`, {
      text: 'test todo',
      type: 'todo',
      requiresApproval: true,
    });

    await user.post(`/tasks/${task._id}/assign/${member._id}`);
    await user.post(`/tasks/${task._id}/assign/${addlMember._id}`);

    const memberTasks = await member.get('/tasks/user');
    syncedTask = find(memberTasks, findAssignedTask);

    const addlMemberTasks = await addlMember.get('/tasks/user');
    addlSyncedTask = find(addlMemberTasks, findAssignedTask);

    try {
      await member.post(`/tasks/${syncedTask._id}/score/up`);
    } catch (e) {
      // eslint-disable-next-line no-empty
    }

    try {
      await addlMember.post(`/tasks/${addlSyncedTask._id}/score/up`);
    } catch (e) {
      // eslint-disable-next-line no-empty
    }
  });

  it('provides only user\'s own tasks when user is not the group leader', async () => {
    const approvals = await member.get(`/approvals/group/${guild._id}`);
    expect(approvals[0]._id).to.equal(syncedTask._id);
    expect(approvals[1]).to.not.exist;
  });

  it('allows group leaders to get a list of tasks that need approval', async () => {
    const approvals = await user.get(`/approvals/group/${guild._id}`);
    expect(approvals[0]._id).to.equal(syncedTask._id);
    expect(approvals[1]._id).to.equal(addlSyncedTask._id);
  });

  it('allows managers to get a list of tasks that need approval', async () => {
    await user.post(`/groups/${guild._id}/add-manager`, {
      managerId: member._id,
    });

    const approvals = await member.get(`/approvals/group/${guild._id}`);
    expect(approvals[0]._id).to.equal(syncedTask._id);
    expect(approvals[1]._id).to.equal(addlSyncedTask._id);
  });
});
