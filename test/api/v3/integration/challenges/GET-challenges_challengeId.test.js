import {
  generateUser,
  createAndPopulateGroup,
  generateChallenge,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('GET /challenges/:challengeId', () => {
  it('fails if challenge doesn\'t exists', async () => {
    let user = await generateUser();
    await expect(user.get(`/challenges/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  context('public guild', () => {
    let groupLeader;
    let group;
    let challenge;
    let user;

    beforeEach(async () => {
      user = await generateUser();

      let populatedGroup = await createAndPopulateGroup({
        groupDetails: {type: 'guild', privacy: 'public'},
      });

      groupLeader = populatedGroup.groupLeader;
      group = populatedGroup.group;

      challenge = await generateChallenge(groupLeader, group);
      await groupLeader.post(`/challenges/${challenge._id}/join`);
    });

    it('should return challenge data', async () => {
      await challenge.sync();
      let chal = await user.get(`/challenges/${challenge._id}`);
      expect(chal.memberCount).to.equal(challenge.memberCount);
      expect(chal.name).to.equal(challenge.name);
      expect(chal._id).to.equal(challenge._id);

      expect(chal.leader).to.eql({
        _id: groupLeader._id,
        id: groupLeader._id,
        profile: {name: groupLeader.profile.name},
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
  });

  context('private guild', () => {
    let groupLeader;
    let challengeLeader;
    let group;
    let challenge;
    let members;
    let nonMember;
    let otherMember;

    beforeEach(async () => {
      nonMember = await generateUser();

      let populatedGroup = await createAndPopulateGroup({
        groupDetails: {type: 'guild', privacy: 'private'},
        members: 2,
      });

      groupLeader = populatedGroup.groupLeader;
      group = populatedGroup.group;
      members = populatedGroup.members;

      challengeLeader = members[0];
      otherMember = members[1];

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
      let chal = await otherMember.get(`/challenges/${challenge._id}`);
      expect(chal.name).to.equal(challenge.name);
      expect(chal._id).to.equal(challenge._id);

      expect(chal.leader).to.eql({
        _id: challengeLeader._id,
        id: challengeLeader._id,
        profile: {name: challengeLeader.profile.name},
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

      let chal = await challengeLeader.get(`/challenges/${challenge._id}`);
      expect(chal.name).to.equal(challenge.name);
      expect(chal._id).to.equal(challenge._id);

      expect(chal.leader).to.eql({
        _id: challengeLeader._id,
        id: challengeLeader._id,
        profile: {name: challengeLeader.profile.name},
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

      let populatedGroup = await createAndPopulateGroup({
        groupDetails: {type: 'party', privacy: 'private'},
        members: 2,
      });

      groupLeader = populatedGroup.groupLeader;
      group = populatedGroup.group;
      members = populatedGroup.members;

      challengeLeader = members[0];
      otherMember = members[1];

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
      let chal = await otherMember.get(`/challenges/${challenge._id}`);
      expect(chal.name).to.equal(challenge.name);
      expect(chal._id).to.equal(challenge._id);

      expect(chal.leader).to.eql({
        _id: challengeLeader._id,
        id: challengeLeader._id,
        profile: {name: challengeLeader.profile.name},
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

      let chal = await challengeLeader.get(`/challenges/${challenge._id}`);
      expect(chal.name).to.equal(challenge.name);
      expect(chal._id).to.equal(challenge._id);

      expect(chal.leader).to.eql({
        _id: challengeLeader._id,
        id: challengeLeader._id,
        profile: {name: challengeLeader.profile.name},
      });
    });
  });
});
