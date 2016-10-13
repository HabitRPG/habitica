import {
  createAndPopulateGroup,
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /groups/:id/chat/:id/clearflags', () => {
  let groupWithChat, message, author, nonAdmin, admin;

  before(async () => {
    let { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        type: 'guild',
        privacy: 'public',
      },
      members: 1,
    });

    groupWithChat = group;
    author = groupLeader;
    nonAdmin = members[0];
    admin = await generateUser({'contributor.admin': true});

    message = await author.post(`/groups/${groupWithChat._id}/chat`, { message: 'Some message' });
    message = message.message;
    admin.post(`/groups/${groupWithChat._id}/chat/${message.id}/flag`);
  });

  context('Single Message', () => {
    it('returns error when non-admin attempts to clear flags', async () => {
      return expect(nonAdmin.post(`/groups/${groupWithChat._id}/chat/${message.id}/clearflags`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('messageGroupChatAdminClearFlagCount'),
        });
    });

    it('returns error if message does not exist', async () => {
      let fakeMessageID = generateUUID();

      await expect(admin.post(`/groups/${groupWithChat._id}/chat/${fakeMessageID}/clearflags`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('messageGroupChatNotFound'),
        });
    });

    it('clears flags and leaves old flags on the flag object', async () => {
      await admin.post(`/groups/${groupWithChat._id}/chat/${message.id}/clearflags`);
      let messages = await admin.get(`/groups/${groupWithChat._id}/chat`);
      expect(messages[0].flagCount).to.eql(0);
      expect(messages[0].flags).to.have.property(admin._id, true);
    });

    it('clears flags in a private group', async () => {
      let { group, members } = await createAndPopulateGroup({
        groupDetails: {
          type: 'party',
          privacy: 'private',
        },
        members: 1,
      });

      let privateMessage = await members[0].post(`/groups/${group._id}/chat`, { message: 'Some message' });
      privateMessage = privateMessage.message;

      await admin.post(`/groups/${group._id}/chat/${privateMessage.id}/flag`);
      await admin.post(`/groups/${group._id}/chat/${privateMessage.id}/clearflags`);

      let messages = await members[0].get(`/groups/${group._id}/chat`);
      expect(messages[0].flagCount).to.eql(0);
    });

    it('can unflag a system message', async () => {
      let { group, members } = await createAndPopulateGroup({
        groupDetails: {
          type: 'party',
          privacy: 'private',
        },
        members: 1,
      });

      let member = members[0];

      // make member that can use skills
      await member.update({
        'stats.lvl': 100,
        'stats.mp': 400,
        'stats.class': 'wizard',
      });

      await member.post('/user/class/cast/mpheal');

      let [skillMsg] = await member.get(`/groups/${group.id}/chat`);

      await member.post(`/groups/${group._id}/chat/${skillMsg.id}/flag`);
      await admin.post(`/groups/${group._id}/chat/${skillMsg.id}/clearflags`);

      let messages = await members[0].get(`/groups/${group._id}/chat`);
      expect(messages[0].id).to.eql(skillMsg.id);
      expect(messages[0].flagCount).to.eql(0);
    });
  });

  context('admin user, group with multiple messages', () => {
    let message2, message3, message4;

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
      let messages = await admin.get(`/groups/${groupWithChat._id}/chat`);

      expect(messages).to.have.lengthOf(4);

      let messageThatWasUnflagged = messages[3];
      let messageWith1Flag = messages[2];
      let messageWith2Flag = messages[1];
      let messageWithoutFlags = messages[0];

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
