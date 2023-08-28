import moment from 'moment';
import { v4 as generateUUID } from 'uuid';
import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import config from '../../../../../config.json';

describe('POST /groups/:id/chat/:id/clearflags', () => {
  const USER_AGE_FOR_FLAGGING = 3;
  let groupWithChat; let message; let author; let nonAdmin; let
    admin;

  before(async () => {
    const { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        type: 'guild',
        privacy: 'private',
      },
      leaderDetails: {
        'auth.timestamps.created': new Date('2022-01-01'),
        balance: 10,
      },
      upgradeToGroupPlan: true,
      members: 2,
    });

    groupWithChat = group;
    author = groupLeader;
    [nonAdmin, admin] = members;
    await nonAdmin.update({ 'auth.timestamps.created': moment().subtract(USER_AGE_FOR_FLAGGING + 1, 'days').toDate() });
    await admin.update({ 'permissions.moderator': true });

    message = await author.post(`/groups/${groupWithChat._id}/chat`, { message: 'Some message' });
    message = message.message;
    admin.post(`/groups/${groupWithChat._id}/chat/${message.id}/flag`);
  });

  context('Single Message', () => {
    it('returns error when non-admin attempts to clear flags', async () => expect(nonAdmin.post(`/groups/${groupWithChat._id}/chat/${message.id}/clearflags`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageGroupChatAdminClearFlagCount'),
      }));

    it('returns error if message does not exist', async () => {
      const fakeMessageID = generateUUID();

      await expect(admin.post(`/groups/${groupWithChat._id}/chat/${fakeMessageID}/clearflags`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('messageGroupChatNotFound'),
        });
    });

    it('clears flags and leaves old flags on the flag object', async () => {
      await admin.post(`/groups/${groupWithChat._id}/chat/${message.id}/clearflags`);
      const messages = await admin.get(`/groups/${groupWithChat._id}/chat`);
      expect(messages[0].flagCount).to.eql(0);
      expect(messages[0].flags).to.have.property(admin._id, true);
    });

    it('clears flags in a private group', async () => {
      const { group, members } = await createAndPopulateGroup({
        groupDetails: {
          type: 'party',
          privacy: 'private',
        },
        members: 2,
      });

      await members[0].update({ 'auth.timestamps.created': new Date('2022-01-01') });
      let privateMessage = await members[0].post(`/groups/${group._id}/chat`, { message: 'Some message' });
      privateMessage = privateMessage.message;

      await admin.post(`/groups/${group._id}/chat/${privateMessage.id}/flag`);

      // first test that the flag was actually successful
      // author always sees own message; flag count is hidden from non-admins
      let messages = await members[0].get(`/groups/${group._id}/chat`);
      expect(messages[0].flagCount).to.eql(0);
      messages = await members[1].get(`/groups/${group._id}/chat`);
      expect(messages.length).to.eql(0);

      // admin cannot directly request private group chat, but after unflag,
      // message should be revealed again and still have flagCount of 0
      await admin.post(`/groups/${group._id}/chat/${privateMessage.id}/clearflags`);
      messages = await members[1].get(`/groups/${group._id}/chat`);
      expect(messages.length).to.eql(1);
      expect(messages[0].flagCount).to.eql(0);
    });

    it('can\'t flag a system message', async () => {
      const { group, members } = await createAndPopulateGroup({
        groupDetails: {
          type: 'party',
          privacy: 'private',
        },
        members: 1,
      });

      const member = members[0];

      // make member that can use skills
      await member.update({
        'stats.lvl': 100,
        'stats.mp': 400,
        'stats.class': 'wizard',
      });

      await member.post('/user/class/cast/mpheal');

      const [skillMsg] = await member.get(`/groups/${group.id}/chat`);
      await expect(member.post(`/groups/${group._id}/chat/${skillMsg.id}/flag`))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: t('messageCannotFlagSystemMessages', { communityManagerEmail: config.EMAILS_COMMUNITY_MANAGER_EMAIL }),
        });
      // let messages = await members[0].get(`/groups/${group._id}/chat`);
      // expect(messages[0].id).to.eql(skillMsg.id);
      // expect(messages[0].flagCount).to.eql(0);
    });
  });

  context('admin user, group with multiple messages', () => {
    let message2; let message3; let
      message4;

    before(async () => {
      message2 = await author.post(`/groups/${groupWithChat._id}/chat`, { message: 'Some message 2' });
      message2 = message2.message;
      await admin.post(`/groups/${groupWithChat._id}/chat/${message2.id}/flag`);

      message3 = await author.post(`/groups/${groupWithChat._id}/chat`, { message: 'Some message 3' });
      message3 = message3.message;
      await admin.post(`/groups/${groupWithChat._id}/chat/${message3.id}/flag`);
      await nonAdmin.post(`/groups/${groupWithChat._id}/chat/${message3.id}/flag`);

      message4 = await author.post(`/groups/${groupWithChat._id}/chat`, { message: 'Some message 4' });
      message4 = message4.message;
    });

    it('changes only the message that is flagged', async () => {
      await admin.post(`/groups/${groupWithChat._id}/chat/${message.id}/clearflags`);
      const messages = await admin.get(`/groups/${groupWithChat._id}/chat`);

      expect(messages).to.have.lengthOf(4);

      const messageThatWasUnflagged = messages[3];
      const messageWith1Flag = messages[2];
      const messageWith2Flag = messages[1];
      const messageWithoutFlags = messages[0];

      expect(messageThatWasUnflagged.flagCount).to.eql(0);
      expect(messageThatWasUnflagged.flags).to.have.property(admin._id, true);

      expect(messageWith1Flag.flagCount).to.eql(5);
      expect(messageWith1Flag.flags).to.have.property(admin._id, true);

      expect(messageWith2Flag.flagCount).to.eql(6);
      expect(messageWith2Flag.flags).to.have.property(admin._id, true);
      expect(messageWith2Flag.flags).to.have.property(nonAdmin._id, true);

      expect(messageWithoutFlags.flagCount).to.eql(0);
      expect(messageWithoutFlags.flags).to.eql({});
    });
  });
});
