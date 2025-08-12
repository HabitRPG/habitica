import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  generateChallenge,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /challenges/:challengeId/join', () => {
  it('returns error when challengeId is not a valid UUID', async () => {
    const user = await generateUser({ balance: 1 });

    await expect(user.post('/challenges/test/join')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns error when challengeId is not for a valid challenge', async () => {
    const user = await generateUser({ balance: 1 });

    await expect(user.post(`/challenges/${generateUUID()}/join`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  context('Joining a valid challenge', () => {
    let groupLeader;
    let group;
    let challenge;
    let authorizedUser;

    beforeEach(async () => {
      const populatedGroup = await createAndPopulateGroup({
        members: 1,
      });

      groupLeader = populatedGroup.groupLeader;
      group = populatedGroup.group;
      authorizedUser = populatedGroup.members[0]; // eslint-disable-line prefer-destructuring

      challenge = await generateChallenge(groupLeader, group);
      await groupLeader.post(`/challenges/${challenge._id}/join`);
    });

    it('returns an error when user isn\'t in the private group and isn\'t challenge leader', async () => {
      const unauthorizedUser = await generateUser();

      await expect(unauthorizedUser.post(`/challenges/${challenge._id}/join`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('challengeNotFound'),
      });
    });

    it('succeeds when user isn\'t in the private group but is challenge leader', async () => {
      await groupLeader.post(`/challenges/${challenge._id}/leave`);
      await groupLeader.post(`/groups/${group._id}/leave`);
      await groupLeader.sync();
      expect(groupLeader.guilds).to.be.empty; // check that leaving worked

      const res = await groupLeader.post(`/challenges/${challenge._id}/join`);
      expect(res.name).to.equal(challenge.name);
    });

    it('returns challenge data', async () => {
      const res = await authorizedUser.post(`/challenges/${challenge._id}/join`);

      expect(res.group).to.eql({
        _id: group._id,
        privacy: group.privacy,
        name: group.name,
        type: group.type,
      });
      expect(res.leader).to.eql({
        _id: groupLeader._id,
        id: groupLeader._id,
        profile: { name: groupLeader.profile.name },
        auth: {
          local: {
            username: groupLeader.auth.local.username,
          },
        },
        flags: {
          verifiedUsername: true,
        },
      });
      expect(res.name).to.equal(challenge.name);
    });

    it('adds challenge to user challenges', async () => {
      await authorizedUser.post(`/challenges/${challenge._id}/join`);

      await authorizedUser.sync();

      expect(authorizedUser).to.have.property('challenges').to.include(challenge._id);
    });

    it('returns error when user has already joined the challenge', async () => {
      await authorizedUser.post(`/challenges/${challenge._id}/join`);

      await expect(authorizedUser.post(`/challenges/${challenge._id}/join`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('userAlreadyInChallenge'),
      });
    });

    it('increases memberCount of challenge', async () => {
      await challenge.sync();
      const oldMemberCount = challenge.memberCount;

      await authorizedUser.post(`/challenges/${challenge._id}/join`);

      await challenge.sync();

      expect(challenge).to.have.property('memberCount', oldMemberCount + 1);
    });

    it('syncs challenge tasks to joining user', async () => {
      const taskText = 'A challenge task text';
      await groupLeader.post(`/tasks/challenge/${challenge._id}`, [
        { type: 'daily', text: taskText },
      ]);

      await authorizedUser.post(`/challenges/${challenge._id}/join`);

      const tasks = await authorizedUser.get('/tasks/user');
      const syncedTask = tasks.find(task => task.text === taskText);

      expect(syncedTask.text).to.eql(taskText);
      expect(syncedTask.isDue).to.exist;
      expect(syncedTask.nextDue).to.exist;
    });

    it('adds challenge tag to user tags', async () => {
      const userTagsLength = (await authorizedUser.get('/tags')).length;

      await authorizedUser.post(`/challenges/${challenge._id}/join`);

      await expect(authorizedUser.get('/tags')).to.eventually.have.length(userTagsLength + 1);
    });

    it('awards achievement if this is user\'s first challenge', async () => {
      await authorizedUser.post(`/challenges/${challenge._id}/join`);

      await authorizedUser.sync();
      expect(authorizedUser.achievements.joinedChallenge).to.be.true;
    });
  });
});
