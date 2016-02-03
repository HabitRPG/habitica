import {
  generateUser,
  generateChallenge,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /challenges/:challengeId/join', () => {
  it('returns error when challengeId is not a valid UUID', async () => {
    let user = await generateUser({ balance: 1});

    await expect(user.post('/challenges/test/join')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns error when challengeId is not for a valid challenge', async () => {
    let user = await generateUser({ balance: 1});

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
      let populatedGroup = await createAndPopulateGroup({
        members: 1,
      });

      groupLeader = populatedGroup.groupLeader;
      group = populatedGroup.group;
      authorizedUser = populatedGroup.members[0];

      challenge = await generateChallenge(groupLeader, group);
    });

    it('returns an error when user doesn\'t have permissions to access the challenge', async () => {
      let unauthorizedUser = await generateUser();

      await expect(unauthorizedUser.post(`/challenges/${challenge._id}/join`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('challengeNotFound'),
      });
    });

    it('returns challenge data', async () => {
      let res = await authorizedUser.post(`/challenges/${challenge._id}/join`);

      expect(res.group).to.eql({
        _id: group._id,
        privacy: group.privacy,
        name: group.name,
        type: group.type,
      });
      expect(res.leader).to.eql({
        _id: groupLeader._id,
        profile: {name: groupLeader.profile.name},
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
      let oldMemberCount = challenge.memberCount;

      await authorizedUser.post(`/challenges/${challenge._id}/join`);

      await challenge.sync();

      expect(challenge).to.have.property('memberCount', oldMemberCount + 1);
    });

    it('syncs challenge tasks to joining user', async () => {
      let taskText = 'A challenge task text';

      await groupLeader.post(`/tasks/challenge/${challenge._id}`, [
        {type: 'habit', text: taskText},
      ]);

      await authorizedUser.post(`/challenges/${challenge._id}/join`);
      let tasks = await authorizedUser.get('/tasks/user');
      let tasksTexts = tasks.map((task) => {
        return task.text;
      });

      expect(tasksTexts).to.include(taskText);
    });

    it('adds challenge tag to user tags', async () => {
      let userTagsLength = (await authorizedUser.get('/tags')).length;

      await authorizedUser.post(`/challenges/${challenge._id}/join`);

      await expect(authorizedUser.get('/tags')).to.eventually.have.length(userTagsLength + 1);
    });
  });
});
