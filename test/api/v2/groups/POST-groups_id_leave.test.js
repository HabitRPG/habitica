import {
  checkExistence,
  createAndPopulateGroup,
} from '../../../helpers/api-integration/v2';

describe('POST /groups/:id/leave', () => {
  context('user is not member of the group', () => {
    it('returns an error');
  });

  context('user is a non-leader member of a guild', () => {
    let user, group;

    beforeEach(async () => {
      let groupData = await createAndPopulateGroup({
        members: 3,
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'public',
        },
      });

      user = groupData.members[0];
      group = groupData.group;
    });

    it('leaves the group', async () => {
      await user.post(`/groups/${group._id}/leave`);

      await user.sync();

      expect(user.guilds).to.not.include(group._id);
    });
  });

  context('user is the last member of a public guild', () => {
    let user, group;

    beforeEach(async () => {
      let groupData = await createAndPopulateGroup({
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'public',
        },
      });

      user = groupData.groupLeader;
      group = groupData.group;
    });

    it('leaves the group accessible', async () => {
      await user.post(`/groups/${group._id}/leave`);

      await expect(user.get(`/groups/${group._id}`)).to.eventually.have.property('_id', group._id);
    });
  });

  context('user is the last member of a private group', () => {
    let user, group;

    beforeEach(async () => {
      let groupData = await createAndPopulateGroup({
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'private',
        },
      });

      user = groupData.groupLeader;
      group = groupData.group;
    });

    it('group is deleted', async () => {
      await user.post(`/groups/${group._id}/leave`);

      await expect(checkExistence('groups', group._id)).to.eventually.eql(false);
    });
  });

  context('user is the last member of a private group with pending invites', () => {
    let user, invitee1, invitee2, group;

    beforeEach(async () => {
      let groupData = await createAndPopulateGroup({
        invites: 2,
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'private',
        },
      });

      user = groupData.groupLeader;
      group = groupData.group;
      invitee1 = groupData.invitees[0];
      invitee2 = groupData.invitees[1];
    });

    it('deletes the group invitations from users', async () => {
      await user.post(`/groups/${group._id}/leave`);

      await expect(invitee1.get('/user')).to.eventually.have.deep.property('invitations.guilds').and.to.be.empty;
      await expect(invitee2.get('/user')).to.eventually.have.deep.property('invitations.guilds').and.to.be.empty;
    });
  });

  context('user is the last member of a party with pending invites', () => {
    let user, invitee1, invitee2, group;

    beforeEach(async () => {
      let groupData = await createAndPopulateGroup({
        invites: 2,
        groupDetails: {
          name: 'test guild',
          type: 'party',
          privacy: 'private',
        },
      });

      user = groupData.groupLeader;
      group = groupData.group;
      invitee1 = groupData.invitees[0];
      invitee2 = groupData.invitees[1];
    });

    it('deletes the group invitations from users', async () => {
      await user.post(`/groups/${group._id}/leave`);

      await expect(invitee1.get('/user')).to.eventually.have.deep.property('invitations.party').and.to.be.empty;
      await expect(invitee2.get('/user')).to.eventually.have.deep.property('invitations.party').and.to.be.empty;
    });
  });
});
