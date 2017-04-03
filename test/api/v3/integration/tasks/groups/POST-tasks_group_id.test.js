import {
  generateUser,
  generateGroup,
  translate as t,
} from '../../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /tasks/group/:groupid', () => {
  let user, guild;

  beforeEach(async () => {
    user = await generateUser({balance: 1});
    guild = await generateGroup(user, {type: 'guild'});
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
    let userWithoutChallenge = await generateUser();

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
    let userThatIsNotLeaderOfGroup = await generateUser({
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
    let task = await user.post(`/tasks/group/${guild._id}`, {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    });

    let groupTask = await user.get(`/tasks/group/${guild._id}`);

    expect(groupTask[0].group.id).to.equal(guild._id);
    expect(task.text).to.eql('test habit');
    expect(task.notes).to.eql('1976');
    expect(task.type).to.eql('habit');
    expect(task.up).to.eql(false);
    expect(task.down).to.eql(true);
  });

  it('creates a todo', async () => {
    let task = await user.post(`/tasks/group/${guild._id}`, {
      text: 'test todo',
      type: 'todo',
      notes: 1976,
    });

    let groupTask = await user.get(`/tasks/group/${guild._id}`);

    expect(groupTask[0].group.id).to.equal(guild._id);
    expect(task.text).to.eql('test todo');
    expect(task.notes).to.eql('1976');
    expect(task.type).to.eql('todo');
  });

  it('creates a daily', async () => {
    let now = new Date();
    let task = await user.post(`/tasks/group/${guild._id}`, {
      text: 'test daily',
      type: 'daily',
      notes: 1976,
      frequency: 'daily',
      everyX: 5,
      startDate: now,
    });

    let groupTask = await user.get(`/tasks/group/${guild._id}`);

    expect(groupTask[0].group.id).to.equal(guild._id);
    expect(task.text).to.eql('test daily');
    expect(task.notes).to.eql('1976');
    expect(task.type).to.eql('daily');
    expect(task.frequency).to.eql('daily');
    expect(task.everyX).to.eql(5);
    expect(new Date(task.startDate)).to.eql(now);
  });
});
