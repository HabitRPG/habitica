import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import { find } from 'lodash';

describe('POST /tasks/:id/approve/:userId', () => {
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

  it('approves an assigned user', async () => {
    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);

    await expect(user.post(`/tasks/${task._id}/approve/${member._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('taskRequiresApproval'),
      });
  });

  // it('prevents user from scoring a task that needs to be approved', async () => {
  //   await user.post(`/tasks/${task._id}/score/up`);
  //   let task = await user.get(`/tasks/${todo._id}`);
  //
  //   expect(task.completed).to.equal(true);
  //   expect(task.dateCompleted).to.be.a('string'); // date gets converted to a string as json doesn't have a Date type
  // });
});
