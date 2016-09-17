import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import { find } from 'lodash';

describe('POST /tasks/:id/score/:direction', () => {
  let user, guild, member, task;

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
  });

  it('prevents user from scoring a task that needs to be approved', async () => {
    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);

    await expect(member.post(`/tasks/${syncedTask._id}/score/up`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('taskRequiresApproval'),
      });
  });

  xit('allows a user to score an apporoved task', async () => {
    await user.post(`/tasks/${task._id}/approve/${member._id}`);
    await user.post(`/tasks/${task._id}/score/up`);
    let updatedTask = await user.get(`/tasks/${task._id}`);

    expect(updatedTask.completed).to.equal(true);
    expect(updatedTask.dateCompleted).to.be.a('string'); // date gets converted to a string as json doesn't have a Date type
  });
});
