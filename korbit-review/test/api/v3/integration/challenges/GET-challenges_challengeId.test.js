import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  createAndPopulateGroup,
  generateChallenge,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /challenges/:challengeId', () => {
  it('fails if challenge doesn\'t exists', async () => {
    const user = await generateUser();
    await expect(user.get(`/challenges/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  context('Group Plan', () => {
    let groupLeader;
    let challengeLeader;
    let group;
    let challenge;
    let members;
    let nonMember;
    let otherMember;

    beforeEach(async () => {
      nonMember = await generateUser();

      const populatedGroup = await createAndPopulateGroup({
        groupDetails: { type: 'guild', privacy: 'private' },
        members: 2,
        upgradeToGroupPlan: true,
      });

      groupLeader = populatedGroup.groupLeader;
      group = populatedGroup.group;
      members = populatedGroup.members;

      [challengeLeader, otherMember] = members;

      challenge = await generateChallenge(challengeLeader, group);
    });

    it('fails if user isn\'t in the guild and isn\'t challenge leader', async () => {
      await expect(nonMember.get(`/challenges/${challenge._id}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('challengeNotFound'),
      });
    });

    it('returns challenge data for any user in the guild', async () => {
      const chal = await otherMember.get(`/challenges/${challenge._id}`);
      expect(chal.name).to.equal(challenge.name);
      expect(chal._id).to.equal(challenge._id);

      expect(chal.leader).to.eql({
        _id: challengeLeader._id,
        id: challengeLeader._id,
        profile: { name: challengeLeader.profile.name },
        auth: {
          local: {
            username: challengeLeader.auth.local.username,
          },
        },
        flags: {
          verifiedUsername: true,
        },
      });
      expect(chal.group).to.eql({
        _id: group._id,
        categories: [],
        id: group.id,
        name: group.name,
        summary: group.name,
        type: group.type,
        privacy: group.privacy,
        leader: groupLeader.id,
      });
    });

    it('returns challenge data if challenge leader isn\'t in the guild or challenge', async () => {
      await challengeLeader.post(`/groups/${group._id}/leave`);
      await challengeLeader.sync();
      expect(challengeLeader.guilds).to.be.empty; // check that leaving worked

      const chal = await challengeLeader.get(`/challenges/${challenge._id}`);
      expect(chal.name).to.equal(challenge.name);
      expect(chal._id).to.equal(challenge._id);

      expect(chal.leader).to.eql({
        _id: challengeLeader._id,
        id: challengeLeader._id,
        profile: { name: challengeLeader.profile.name },
        auth: {
          local: {
            username: challengeLeader.auth.local.username,
          },
        },
        flags: {
          verifiedUsername: true,
        },
      });
    });
  });

  context('party', () => {
    let groupLeader;
    let challengeLeader;
    let group;
    let challenge;
    let members;
    let nonMember;
    let otherMember;

    beforeEach(async () => {
      nonMember = await generateUser();

      const populatedGroup = await createAndPopulateGroup({
        groupDetails: { type: 'party', privacy: 'private' },
        members: 2,
      });

      groupLeader = populatedGroup.groupLeader;
      group = populatedGroup.group;
      members = populatedGroup.members;

      challengeLeader = members[0]; // eslint-disable-line prefer-destructuring
      otherMember = members[1]; // eslint-disable-line prefer-destructuring

      challenge = await generateChallenge(challengeLeader, group);
    });

    it('fails if user isn\'t in the party and isn\'t challenge leader', async () => {
      await expect(nonMember.get(`/challenges/${challenge._id}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('challengeNotFound'),
      });
    });

    it('returns challenge data for any user in the party', async () => {
      const chal = await otherMember.get(`/challenges/${challenge._id}`);
      expect(chal.name).to.equal(challenge.name);
      expect(chal._id).to.equal(challenge._id);

      expect(chal.leader).to.eql({
        _id: challengeLeader._id,
        id: challengeLeader._id,
        profile: { name: challengeLeader.profile.name },
        auth: {
          local: {
            username: challengeLeader.auth.local.username,
          },
        },
        flags: {
          verifiedUsername: true,
        },
      });
      expect(chal.group).to.eql({
        _id: group._id,
        id: group._id,
        categories: [],
        name: group.name,
        summary: group.name,
        type: group.type,
        privacy: group.privacy,
        leader: groupLeader.id,
      });
    });

    it('returns challenge data if challenge leader isn\'t in the party or challenge', async () => {
      await challengeLeader.post('/groups/party/leave');
      await challengeLeader.sync();
      expect(challengeLeader.party._id).to.be.undefined; // check that leaving worked

      const chal = await challengeLeader.get(`/challenges/${challenge._id}`);
      expect(chal.name).to.equal(challenge.name);
      expect(chal._id).to.equal(challenge._id);

      expect(chal.leader).to.eql({
        _id: challengeLeader._id,
        id: challengeLeader._id,
        profile: { name: challengeLeader.profile.name },
        auth: {
          local: {
            username: challengeLeader.auth.local.username,
          },
        },
        flags: {
          verifiedUsername: true,
        },
      });
    });
  });
});
