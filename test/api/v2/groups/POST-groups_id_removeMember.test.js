import {
  createAndPopulateGroup,
  translate as t,
} from '../../../helpers/api-integration/v2';

describe('POST /groups/:id/removeMember', () => {
  context('user is not member of the group', () => {
    it('returns an error');
  });

  context('user is a non-leader member of a guild', () => {
    it('returns an error');
  });

  context('user is the leader of a guild', () => {
    let leader, member, group;

    beforeEach(async () => {
      return createAndPopulateGroup({
        members: 1,
        groupDetails: {
          name: 'test group',
          type: 'guild',
          privacy: 'public',
        },
      }).then((res) => {
        leader = res.groupLeader;
        member = res.members[0];
        group = res.group;
      });
    });

    it('does not allow leader to remove themselves', async () => {
      return expect(leader.post(`/groups/${group._id}/removeMember`, null, {
        uuid: leader._id,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageGroupCannotRemoveSelf'),
      });
    });

    it('can remove other members of guild', async () => {
      return leader.post(`/groups/${group._id}/removeMember`, null, {
        uuid: member._id,
      }).then(() => {
        return leader.get(`/groups/${group._id}`);
      }).then((guild) => {
        expect(guild.members).to.have.a.lengthOf(1);
        expect(guild.members[0]._id).to.not.eql(member._id);
      });
    });
  });
});
