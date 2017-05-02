import {
  createAndPopulateGroup,
} from '../../../../../helpers/api-integration/v3';
import { find } from 'lodash';

describe('PUT /tasks/:id', () => {
  let user, guild, member, member2, task;

  function findAssignedTask (memberTask) {
    return memberTask.group.id === guild._id;
  }

  beforeEach(async () => {
    let {group, members, groupLeader} = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Guild',
        type: 'guild',
      },
      members: 2,
    });

    guild = group;
    user = groupLeader;
    member = members[0];
    member2 = members[1];

    task = await user.post(`/tasks/group/${guild._id}`, {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    });

    await user.post(`/tasks/${task._id}/assign/${member._id}`);
    await user.post(`/tasks/${task._id}/assign/${member2._id}`);
  });

  it('updates a group task', async () => {
    let savedHabit = await user.put(`/tasks/${task._id}`, {
      text: 'some new text',
      up: false,
      down: false,
      notes: 'some new notes',
    });

    expect(savedHabit.text).to.eql('some new text');
    expect(savedHabit.notes).to.eql('some new notes');
    expect(savedHabit.up).to.eql(false);
    expect(savedHabit.down).to.eql(false);
  });

  it('updates the linked tasks', async () => {
    await user.put(`/tasks/${task._id}`, {
      text: 'some new text',
      up: false,
      down: false,
      notes: 'some new notes',
    });


    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);

    expect(syncedTask.text).to.eql('some new text');
    expect(syncedTask.up).to.eql(false);
    expect(syncedTask.down).to.eql(false);
  });

  it('updates the linked tasks for all assigned users', async () => {
    await user.put(`/tasks/${task._id}`, {
      text: 'some new text',
      up: false,
      down: false,
      notes: 'some new notes',
    });

    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);

    let member2Tasks = await member2.get('/tasks/user');
    let member2SyncedTask = find(member2Tasks, findAssignedTask);

    expect(syncedTask.text).to.eql('some new text');
    expect(syncedTask.up).to.eql(false);
    expect(syncedTask.down).to.eql(false);

    expect(member2SyncedTask.text).to.eql('some new text');
    expect(member2SyncedTask.up).to.eql(false);
    expect(member2SyncedTask.down).to.eql(false);
  });

  it('updates the linked tasks', async () => {
    await user.post(`/groups/${guild._id}/add-manager`, {
      managerId: member2._id,
    });

    await member2.put(`/tasks/${task._id}`, {
      text: 'some new text',
      up: false,
      down: false,
      notes: 'some new notes',
    });


    let memberTasks = await member.get('/tasks/user');
    let syncedTask = find(memberTasks, findAssignedTask);

    expect(syncedTask.text).to.eql('some new text');
    expect(syncedTask.up).to.eql(false);
    expect(syncedTask.down).to.eql(false);
  });
});
