import {
  createAndPopulateGroup,
} from '../../../../helpers/api-integration/v2';

describe('GET /groups/:id/chat', () => {
  context('group with multiple messages', () => {
    let group, member, user;

    beforeEach(async () => {
      let groupData = await createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
        },
        members: 1,
      });

      group = groupData.group;
      user = groupData.groupLeader;
      member = groupData.members[0];

      await member.post(`/groups/${group._id}/chat`, null, { message: 'Group member message' });
      await user.post(`/groups/${group._id}/chat`, null, { message: 'User message' });
    });

    it('gets messages', async () => {
      let messages = await user.get(`/groups/${group._id}/chat`);

      expect(messages).to.have.length(2);

      let message = messages[0];

      expect(message.id).to.exist;
      expect(message.text).to.exist;
      expect(message.uuid).to.exist;
    });
  });
});
