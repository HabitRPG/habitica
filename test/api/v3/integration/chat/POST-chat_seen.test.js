import {
  createAndPopulateGroup,
  sleep,
} from '../../../../helpers/api-integration/v3';

describe('POST /groups/:id/chat/seen', () => {
  context('Guild', () => {
    let guild; let guildLeader; let guildMember; let
      guildMessage;

    before(async () => {
      const { group, groupLeader, members } = await createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'private',
        },
        members: 1,
        leaderDetails: {
          'auth.timestamps.created': new Date('2022-01-01'),
          balance: 10,
        },
        upgradeToGroupPlan: true,
      });

      guild = group;
      guildLeader = groupLeader;
      [guildMember] = members;

      guildMessage = await guildLeader.post(`/groups/${guild._id}/chat`, { message: 'Some guild message' });
      guildMessage = guildMessage.message;
    });

    it('clears new messages for a guild', async () => {
      await sleep(1);
      await guildMember.sync();
      const initialNotifications = guildMember.notifications.length;
      await guildMember.post(`/groups/${guild._id}/chat/seen`);

      await sleep(1);

      const guildThatHasSeenChat = await guildMember.get('/user');

      expect(guildThatHasSeenChat.notifications.length).to.equal(initialNotifications - 1);
      expect(guildThatHasSeenChat.newMessages).to.be.empty;
    });
  });

  context('Party', () => {
    let party; let partyLeader; let partyMember; let
      partyMessage;

    before(async () => {
      const { group, groupLeader, members } = await createAndPopulateGroup({
        groupDetails: {
          type: 'party',
          privacy: 'private',
        },
        members: 1,
        leaderDetails: {
          'auth.timestamps.created': new Date('2022-01-01'),
        },
      });

      party = group;
      partyLeader = groupLeader;
      partyMember = members[0]; // eslint-disable-line prefer-destructuring

      partyMessage = await partyLeader.post(`/groups/${party._id}/chat`, { message: 'Some party message' });
      partyMessage = partyMessage.message;
    });

    it('clears new messages for a party', async () => {
      await sleep(1);
      await partyMember.sync();
      const initialNotifications = partyMember.notifications.length;
      await partyMember.post(`/groups/${party._id}/chat/seen`);

      await sleep(1);

      const partyMemberThatHasSeenChat = await partyMember.get('/user');

      expect(partyMemberThatHasSeenChat.notifications.length).to.equal(initialNotifications - 1);
      expect(partyMemberThatHasSeenChat.newMessages).to.be.empty;
    });
  });
});
