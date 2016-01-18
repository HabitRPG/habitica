import {
  createAndPopulateGroup,
  generateUser,
  translate as t,
} from '../../../helpers/api-integration/v2';
import { each } from 'lodash';

describe('POST /groups/:id/join', () => {
  context('user is already a member of the group', () => {
    it('returns an error');
  });

  each({
    'public guild': {type: 'guild', privacy: 'public'},
    'private guild': {type: 'guild', privacy: 'private'},
    party: {type: 'party', privacy: 'private'},
  }, (groupDetails, groupType) => {
    context(`user has invitation to a ${groupType}`, () => {
      let group, invitee;

      beforeEach(async () => {
        let groupData = await createAndPopulateGroup({
          groupDetails,
          invites: 1,
        });
        group = groupData.group;
        invitee = groupData.invitees[0];
      });

      it(`allows user to join a ${groupType}`, async () => {
        await invitee.post(`/groups/${group._id}/join`);

        await group.sync();

        expect(group.members).to.include(invitee._id);
      });
    });
  });

  each({
    'private guild': {type: 'guild', privacy: 'private'},
    party: {type: 'party', privacy: 'private'},
  }, (groupDetails, groupType) => {
    context(`user does not have an invitation to a ${groupType}`, () => {
      let group, user;

      beforeEach(async () => {
        let groupData = await createAndPopulateGroup({
          groupDetails,
        });
        group = groupData.group;
        user = await generateUser();
      });

      it(`does not allow user to join a ${groupType}`, async () => {
        await expect(user.post(`/groups/${group._id}/join`)).to.eventually.be.rejected.and.eql({
          code: 401,
          text: t('messageGroupRequiresInvite'),
        });
      });
    });
  });

  context('user does not have an invitation to a public group', () => {
    let group, user;

    beforeEach(async () => {
      let groupData = await createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
        },
      });
      group = groupData.group;
      user = await generateUser();
    });

    it('allows user to join a public guild', async () => {
      await user.post(`/groups/${group._id}/join`);

      await group.sync();

      expect(group.members).to.include(user._id);
    });
  });

  context('public guild has no leader', () => {
    let user, group;

    beforeEach(async () => {
      let groupData = await createAndPopulateGroup({
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'public',
        },
      });
      group = groupData.group;
      await groupData.groupLeader.post(`/groups/${group._id}/leave`);
      user = await generateUser();
    });

    it('makes the joining user the leader', async () => {
      await user.post(`/groups/${group._id}/join`);

      await group.sync();

      await expect(group.leader).to.eql(user._id);
    });
  });
});
