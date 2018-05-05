import {
  createAndPopulateGroup,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /groups/:id/chat/seen', () => {
  context('Guild', () => {
    let guild, guildLeader, guildMember, guildMessage;

    before(async () => {
      let { group, groupLeader, members } = await createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
        },
        members: 1,
      });

      guild = group;
      guildLeader = groupLeader;
      guildMember = members[0];

      guildMessage = await guildLeader.post(`/groups/${guild._id}/chat`, { message: 'Some guild message' });
      guildMessage = guildMessage.message;
    });

    it('clears new messages for a guild', async () => {
      await guildMember.post(`/groups/${guild._id}/chat/seen`);

      let guildThatHasSeenChat = await guildMember.get('/user');

      expect(guildThatHasSeenChat.newMessages).to.be.empty;
    });
  });

  context('Party', () => {
    let party, partyLeader, partyMember, partyMessage;

    before(async () => {
      let { group, groupLeader, members } = await createAndPopulateGroup({
        groupDetails: {
          type: 'party',
          privacy: 'private',
        },
        members: 1,
      });

      party = group;
      partyLeader = groupLeader;
      partyMember = members[0];

      partyMessage = await partyLeader.post(`/groups/${party._id}/chat`, { message: 'Some party message' });
      partyMessage = partyMessage.message;
    });

    it('clears new messages for a party', async () => {
      await partyMember.post(`/groups/${party._id}/chat/seen`);

      let partyMemberThatHasSeenChat = await partyMember.get('/user');

      expect(partyMemberThatHasSeenChat.newMessages).to.be.empty;
    });
  });
});
