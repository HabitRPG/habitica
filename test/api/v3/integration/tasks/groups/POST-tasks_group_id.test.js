import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('POST /tasks/group/:groupid', () => {
  let user; let guild; let
    manager;
  let tzoffset;
  const groupName = 'Test Public Guild';
  const groupType = 'guild';

  before(async () => {
    tzoffset = new Date().getTimezoneOffset();
  });

  beforeEach(async () => {
    //  user = await generateUser({ balance: 1, 'preferences.timezoneOffset': tzoffset });
    const { group, groupLeader, members } = await createAndPopulateGroup({
      leaderDetails: { balance: 10, 'preferences.timezoneOffset': tzoffset },
      groupDetails: {
        name: groupName,
        type: groupType,
        privacy: 'private',
      },
      members: 1,
      upgradeToGroupPlan: true,
    });

    guild = group;
    user = groupLeader;
    manager = members[0]; // eslint-disable-line prefer-destructuring
  });

  it('returns error when group is not found', async () => {
    await expect(user.post(`/tasks/group/${generateUUID()}`, {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
  });

  it('returns error when user is not a member of the group', async () => {
    const userWithoutChallenge = await generateUser();

    await expect(userWithoutChallenge.post(`/tasks/group/${guild._id}`, {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
  });

  it('returns error when non leader tries to create a task', async () => {
    const userThatIsNotLeaderOfGroup = await generateUser({
      guilds: [guild._id],
    });

    await expect(userThatIsNotLeaderOfGroup.post(`/tasks/group/${guild._id}`, {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('onlyGroupLeaderCanEditTasks'),
    });
  });

  it('creates a habit', async () => {
    const task = await user.post(`/tasks/group/${guild._id}`, {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    });

    const groupTask = await user.get(`/tasks/group/${guild._id}`);

    expect(groupTask[0].group.id).to.equal(guild._id);
    expect(task.text).to.eql('test habit');
    expect(task.notes).to.eql('1976');
    expect(task.type).to.eql('habit');
    expect(task.up).to.eql(false);
    expect(task.down).to.eql(true);
  });

  it('creates a todo', async () => {
    const task = await user.post(`/tasks/group/${guild._id}`, {
      text: 'test todo',
      type: 'todo',
      notes: 1976,
    });

    const groupTask = await user.get(`/tasks/group/${guild._id}`);

    expect(groupTask[0].group.id).to.equal(guild._id);
    expect(task.text).to.eql('test todo');
    expect(task.notes).to.eql('1976');
    expect(task.type).to.eql('todo');
  });

  it('creates a daily', async () => {
    const now = new Date();
    const task = await user.post(`/tasks/group/${guild._id}`, {
      text: 'test daily',
      type: 'daily',
      notes: 1976,
      frequency: 'daily',
      everyX: 5,
      startDate: now,
    });

    const groupTask = await user.get(`/tasks/group/${guild._id}`);

    expect(groupTask[0].group.id).to.equal(guild._id);
    expect(task.text).to.eql('test daily');
    expect(task.notes).to.eql('1976');
    expect(task.type).to.eql('daily');
    expect(task.frequency).to.eql('daily');
    expect(task.everyX).to.eql(5);
    expect(new Date(task.startDate)).to.eql(new Date(now.setHours(0, 0, 0, 0)));
  });

  it('allows a manager to add a group task', async () => {
    await user.post(`/groups/${guild._id}/add-manager`, {
      managerId: manager._id,
    });

    const task = await manager.post(`/tasks/group/${guild._id}`, {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    });

    const groupTask = await manager.get(`/tasks/group/${guild._id}`);

    expect(groupTask[0].group.id).to.equal(guild._id);
    expect(task.text).to.eql('test habit');
    expect(task.notes).to.eql('1976');
    expect(task.type).to.eql('habit');
    expect(task.up).to.eql(false);
    expect(task.down).to.eql(true);
  });
});
