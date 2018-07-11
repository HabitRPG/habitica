import {
  createAndPopulateGroup,
  sleep,
} from '../../../../helpers/api-integration/v3';

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
      await sleep(1);
      await guildMember.sync();
      const initialNotifications = guildMember.notifications.length;
      await guildMember.post(`/groups/${guild._id}/chat/seen`);

      await sleep(1);

      let guildThatHasSeenChat = await guildMember.get('/user');

      expect(guildThatHasSeenChat.notifications.length).to.equal(initialNotifications - 1);
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
      await sleep(1);
      await partyMember.sync();
      const initialNotifications = partyMember.notifications.length;
      await partyMember.post(`/groups/${party._id}/chat/seen`);

      await sleep(1);

      let partyMemberThatHasSeenChat = await partyMember.get('/user');

      expect(partyMemberThatHasSeenChat.notifications.length).to.equal(initialNotifications - 1);
      expect(partyMemberThatHasSeenChat.newMessages).to.be.empty;
    });
  });
});
