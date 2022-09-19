import {
  createAndPopulateGroup, translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('PUT /tasks/:id', () => {
  let user;
  let guild;
  let member;
  let member2;
  let habit;
  let todo;

  beforeEach(async () => {
    const { group, members, groupLeader } = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Guild',
        type: 'guild',
      },
      members: 2,
      upgradeToGroupPlan: true,
    });

    guild = group;
    user = groupLeader;
    member = members[0]; // eslint-disable-line prefer-destructuring
    member2 = members[1]; // eslint-disable-line prefer-destructuring

    habit = await user.post(`/tasks/group/${guild._id}`, {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    });

    todo = await user.post(`/tasks/group/${guild._id}`, {
      text: 'test todo',
      type: 'todo',
      notes: 1976,
    });

    await user.post(`/tasks/${habit._id}/assign`, [member._id, member2._id]);
  });

  it('updates a group task', async () => {
    const savedHabit = await user.put(`/tasks/${habit._id}`, {
      notes: 'some new notes',
    });

    expect(savedHabit.notes).to.eql('some new notes');
  });

  it('member updates a group task value - not allowed', async () => {
    // change the todo
    await expect(member.put(`/tasks/${habit._id}`, {
      text: 'new text!',
    })).to.eventually.be.rejected.and.to.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('onlyGroupLeaderCanEditTasks'),
    });
  });

  it('member updates the collapseChecklist property - change is allowed', async () => {
    // change the todo
    await member.put(`/tasks/${todo._id}`, {
      collapseChecklist: true,
    });
  });

  it('member updates the collapseChecklist and another property - change not allowed', async () => {
    // change the todo
    await expect(member.put(`/tasks/${todo._id}`, {
      collapseChecklist: true,
      title: 'test',
    })).to.eventually.be.rejected.and.to.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('onlyGroupLeaderCanEditTasks'),
    });
  });

  it('updates a group task with checklist', async () => {
    // add a new todo
    habit = await user.post(`/tasks/group/${guild._id}`, {
      text: 'todo',
      type: 'todo',
      checklist: [
        {
          text: 'checklist 1',
        },
      ],
    });

    await user.post(`/tasks/${habit._id}/assign`, [member._id]);

    // change the checklist text
    habit = await user.put(`/tasks/${habit._id}`, {
      checklist: [
        {
          id: habit.checklist[0].id,
          text: 'checklist 1 - edit',
        },
        {
          text: 'checklist 2 - edit',
        },
      ],
    });

    expect(habit.checklist.length).to.eql(2);
  });
});
