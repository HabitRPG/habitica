import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  translate as t,
  createAndPopulateGroup,
  generateChallenge,
} from '../../../../helpers/api-integration/v3';

describe('GET /tasks/:id', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  context('general', () => {
    context('task cannot be accessed', () => {
      it('cannot get a non-existent task', async () => {
        const dummyId = generateUUID();

        await expect(user.get(`/tasks/${dummyId}`)).to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('messageTaskNotFound'),
        });
      });
    });
  });

  context('user', () => {
    context('task can be accessed', async () => {
      let task;

      beforeEach(async () => {
        task = await user.post('/tasks/user', {
          text: 'test habit',
          type: 'habit',
          alias: 'alias',
        });
      });

      it('gets specified task', async () => {
        const getTask = await user.get(`/tasks/${task._id}`);

        expect(getTask).to.eql(task);
      });

      it('can use alias to retrieve task', async () => {
        const getTask = await user.get(`/tasks/${task.alias}`);

        expect(getTask).to.eql(task);
      });
    });

    context('task cannot be accessed', () => {
      it('cannot get a task owned by someone else', async () => {
        const anotherUser = await generateUser();
        const task = await user.post('/tasks/user', {
          text: 'test habit',
          type: 'habit',
        });

        await expect(anotherUser.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('messageTaskNotFound'),
        });
      });
    });
  });

  context('challenge', () => {
    let challenge; let task; let leader; let member;

    before(async () => {
      const populatedGroup = await createAndPopulateGroup({
        members: 1,
      });

      const guild = populatedGroup.group;
      leader = populatedGroup.groupLeader;
      member = populatedGroup.members[0]; // eslint-disable-line prefer-destructuring

      challenge = await generateChallenge(leader, guild);
      await leader.post(`/challenges/${challenge._id}/join`);

      task = await leader.post(`/tasks/challenge/${challenge._id}`, {
        text: 'test habit',
        type: 'habit',
      });
    });

    context('task can be accessed', async () => {
      it('can get challenge task if member of that challenge', async () => {
        await member.post(`/challenges/${challenge._id}/join`);

        const getTask = await member.get(`/tasks/${task._id}`);
        expect(getTask).to.eql(task);
      });

      it('can get challenge task if leader of that challenge', async () => {
        const getTask = await leader.get(`/tasks/${task._id}`);
        expect(getTask).to.eql(task);
      });

      it('can get challenge task if admin', async () => {
        const admin = await generateUser({
          'permissions.challengeAdmin': true,
        });

        const getTask = await admin.get(`/tasks/${task._id}`);
        expect(getTask).to.eql(task);
      });
    });

    context('task cannot be accessed', () => {
      it('cannot get a task in a challenge i am not part of', async () => {
        await expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('messageTaskNotFound'),
        });
      });
    });
  });

  context('group', () => {
    let group; let task; let members; let leader;

    before(async () => {
      const groupData = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Guild',
          type: 'guild',
        },
        members: 1,
        upgradeToGroupPlan: true,
      });

      group = groupData.group;
      members = groupData.members;
      leader = groupData.groupLeader;

      task = await leader.post(`/tasks/group/${group._id}`, {
        text: 'test habit',
        type: 'habit',
      });
    });

    context('task can be accessed', async () => {
      it('can get group task if leader of that group', async () => {
        const getTask = await leader.get(`/tasks/${task._id}`);
        expect(getTask).to.eql(task);
      });

      it('can get group task if member of that group', async () => {
        const getTask = await members[0].get(`/tasks/${task._id}`);
        expect(getTask).to.eql(task);
      });
    });

    context('task cannot be accessed', () => {
      it('cannot get a task in a group i am not part of', async () => {
        await expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('messageTaskNotFound'),
        });
      });
    });
  });
});
