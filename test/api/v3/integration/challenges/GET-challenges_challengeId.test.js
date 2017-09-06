import {
  generateUser,
  createAndPopulateGroup,
  generateChallenge,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
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
    });

    it('should return challenge data', async () => {
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
    let group;
    let challenge;
    let members;
    let user;

    beforeEach(async () => {
      user = await generateUser();

      let populatedGroup = await createAndPopulateGroup({
        groupDetails: {type: 'guild', privacy: 'private'},
        members: 1,
      });

      groupLeader = populatedGroup.groupLeader;
      group = populatedGroup.group;
      members = populatedGroup.members;

      challenge = await generateChallenge(groupLeader, group);
      await members[0].post(`/challenges/${challenge._id}/join`);
    });

    it('fails if user doesn\'t have access to the challenge', async () => {
      await expect(user.get(`/challenges/${challenge._id}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('challengeNotFound'),
      });
    });

    it('should return challenge data', async () => {
      let chal = await members[0].get(`/challenges/${challenge._id}`);
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

  context('party', () => {
    let groupLeader;
    let group;
    let challenge;
    let members;
    let user;

    beforeEach(async () => {
      user = await generateUser();

      let populatedGroup = await createAndPopulateGroup({
        groupDetails: {type: 'party'},
        members: 1,
      });

      groupLeader = populatedGroup.groupLeader;
      group = populatedGroup.group;
      members = populatedGroup.members;

      challenge = await generateChallenge(groupLeader, group);
      await members[0].post(`/challenges/${challenge._id}/join`);
    });

    it('fails if user doesn\'t have access to the challenge', async () => {
      await expect(user.get(`/challenges/${challenge._id}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('challengeNotFound'),
      });
    });

    it('should return challenge data', async () => {
      let chal = await members[0].get(`/challenges/${challenge._id}`);
      expect(chal.name).to.equal(challenge.name);
      expect(chal._id).to.equal(challenge._id);

      expect(chal.leader).to.eql({
        _id: groupLeader._id,
        id: groupLeader.id,
        profile: {name: groupLeader.profile.name},
      });
      expect(chal.group).to.eql({
        _id: group._id,
        id: group.id,
        categories: [],
        name: group.name,
        summary: group.name,
        type: group.type,
        privacy: group.privacy,
        leader: groupLeader.id,
      });
    });
  });
});
