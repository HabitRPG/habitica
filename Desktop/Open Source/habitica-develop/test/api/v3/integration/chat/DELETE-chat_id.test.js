import {
  createAndPopulateGroup,
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('DELETE /groups/:groupId/chat/:chatId', () => {
  let groupWithChat, message, user, userThatDidNotCreateChat, admin;

  before(async () => {
    let { group, groupLeader } = await createAndPopulateGroup({
      groupDetails: {
        type: 'guild',
        privacy: 'public',
      },
    });

    groupWithChat = group;
    user = groupLeader;
    message = await user.post(`/groups/${groupWithChat._id}/chat`, { message: 'Some message' });
    message = message.message;
    userThatDidNotCreateChat = await generateUser();
    admin = await generateUser({'contributor.admin': true});
  });

  context('Chat errors', () => {
    it('returns an error is message does not exist', async () => {
      let fakeChatId = generateUUID();
      await expect(user.del(`/groups/${groupWithChat._id}/chat/${fakeChatId}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageGroupChatNotFound'),
      });
    });

    it('returns an error when user does not have permission to delete', async () => {
      await expect(userThatDidNotCreateChat.del(`/groups/${groupWithChat._id}/chat/${message.id}`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyCreatorOrAdminCanDeleteChat'),
      });
    });
  });

  context('Chat success', () => {
    let nextMessage;

    beforeEach(async () => {
      nextMessage = await user.post(`/groups/${groupWithChat._id}/chat`, { message: 'Some new message' });
      nextMessage = nextMessage.message;
    });

    it('allows creator to delete a their message', async () => {
      await user.del(`/groups/${groupWithChat._id}/chat/${nextMessage.id}`);
      let messages = await user.get(`/groups/${groupWithChat._id}/chat/`);
      expect(messages).is.an('array');
      expect(messages).to.not.include(nextMessage);
    });

    it('allows admin to delete another user\'s message', async () => {
      await admin.del(`/groups/${groupWithChat._id}/chat/${nextMessage.id}`);
      let messages = await user.get(`/groups/${groupWithChat._id}/chat/`);
      expect(messages).is.an('array');
      expect(messages).to.not.include(nextMessage);
    });

    it('returns empty when previous message parameter is passed and the last message was deleted', async () => {
      await expect(user.del(`/groups/${groupWithChat._id}/chat/${nextMessage.id}?previousMsg=${nextMessage.id}`))
        .to.eventually.be.empty;
    });

    it('returns the update chat when previous message parameter is passed and the chat is updated', async () => {
      await expect(user.del(`/groups/${groupWithChat._id}/chat/${nextMessage.id}?previousMsg=${message.id}`))
        .eventually
        .is.an('array')
        .to.include(message)
        .to.be.lengthOf(1);
    });
  });
});
