import { find } from 'lodash';
import {
  createAndPopulateGroup, translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('PUT /tasks/:id', () => {
  let user; let guild; let member; let member2; let
    task;

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
    member2 = members[1]; // eslint-disable-line prefer-destructuring

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
    const savedHabit = await user.put(`/tasks/${task._id}`, {
      notes: 'some new notes',
    });

    expect(savedHabit.notes).to.eql('some new notes');
  });

  it('updates a group task - approval is required', async () => {
    // allow to manage
    await user.post(`/groups/${guild._id}/add-manager`, {
      managerId: member._id,
    });

    // change the todo
    task = await member.put(`/tasks/${task._id}`, {
      text: 'new text!',
      requiresApproval: true,
    });

    const memberTasks = await member2.get('/tasks/user');
    const syncedTask = find(memberTasks, memberTask => memberTask.group.taskId === task._id);

    // score up to trigger approval
    await expect(member2.post(`/tasks/${syncedTask._id}/score/up`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('taskApprovalHasBeenRequested'),
      });
  });

  it('updates a group task with checklist', async () => {
    // add a new todo
    task = await user.post(`/tasks/group/${guild._id}`, {
      text: 'todo',
      type: 'todo',
      checklist: [
        {
          text: 'checklist 1',
        },
      ],
    });

    await user.post(`/tasks/${task._id}/assign/${member._id}`);

    // change the checklist text
    task = await user.put(`/tasks/${task._id}`, {
      checklist: [
        {
          id: task.checklist[0].id,
          text: 'checklist 1 - edit',
        },
        {
          text: 'checklist 2 - edit',
        },
      ],
    });

    expect(task.checklist.length).to.eql(2);
  });

  it('updates the linked tasks', async () => {
    await user.put(`/tasks/${task._id}`, {
      text: 'some new text',
      up: false,
      down: false,
      notes: 'some new notes',
    });


    const memberTasks = await member.get('/tasks/user');
    const syncedTask = find(memberTasks, findAssignedTask);

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

    const memberTasks = await member.get('/tasks/user');
    const syncedTask = find(memberTasks, findAssignedTask);

    const member2Tasks = await member2.get('/tasks/user');
    const member2SyncedTask = find(member2Tasks, findAssignedTask);

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


    const memberTasks = await member.get('/tasks/user');
    const syncedTask = find(memberTasks, findAssignedTask);

    expect(syncedTask.text).to.eql('some new text');
    expect(syncedTask.up).to.eql(false);
    expect(syncedTask.down).to.eql(false);
  });
});
