import {
  createAndPopulateGroup,
  generateUser,
} from '../../../helpers/api-integration/v2';
import { each } from 'lodash';

describe('POST /groups/:id/invite', () => {
  context('user is a member of the group', () => {
    each({
      'public guild': {type: 'guild', privacy: 'public'},
      'private guild': {type: 'guild', privacy: 'private'},
      party: {type: 'party', privacy: 'private'},
    }, (groupDetails, groupType) => {
      let group, invitee, inviter;

      beforeEach(async () => {
        invitee = await generateUser();
        let groupData = await createAndPopulateGroup({
          groupDetails,
          members: 1,
        });
        group = groupData.group;
        inviter = groupData.members[0];
      });

      it(`allows user to send an invitation for a ${groupType}`, async () => {
        await inviter.post(`/groups/${group._id}/invite`, {
          uuids: [invitee._id],
        });
        group = await inviter.get(`/groups/${group._id}`);
        expect(_.find(group.invites, {_id: invitee._id})._id).to.exists;
      });
    });
  });

  context('user is a not member of the group', () => {
    each({
      'public guild': {type: 'guild', privacy: 'public'},
    }, (groupDetails, groupType) => {
      context(`the group is a ${groupType}`, () => {
        let group, invitee, inviter;

        beforeEach(async () => {
          invitee = await generateUser();
          inviter = await generateUser();
          let groupData = await createAndPopulateGroup({
            groupDetails,
          });
          group = groupData.group;
        });

        it(`allows user to send an invitation for a ${groupType}`, async () => {
          await inviter.post(`/groups/${group._id}/invite`, {
            uuids: [invitee._id],
          });
          group = await inviter.get(`/groups/${group._id}`);
          expect(_.find(group.invites, {_id: invitee._id})._id).to.exists;
        });
      });
    });

    each({
      'private guild': {type: 'guild', privacy: 'private'},
      party: {type: 'party', privacy: 'private'},
    }, (groupDetails, groupType) => {
      context(`the group is a ${groupType}`, () => {
        let group, invitee, inviter;

        beforeEach(async () => {
          invitee = await generateUser();
          inviter = await generateUser();
          let groupData = await createAndPopulateGroup({
            groupDetails,
          });
          group = groupData.group;
        });

        it(`does not allows user to send an invitation for a ${groupType}`, async () => {
          return expect(inviter.post(`/groups/${group._id}/invite`, {
            uuids: [invitee._id],
          })).to.eventually.be.rejected.and.eql({
            code: 401,
            text: 'Only a member can invite new members!',
          });
        });
      });
    });
  });
});
