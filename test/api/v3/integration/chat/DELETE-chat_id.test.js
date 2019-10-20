import { v4 as generateUUID } from 'uuid';
import {
  createAndPopulateGroup,
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('DELETE /groups/:groupId/chat/:chatId', () => {
  let groupWithChat; let message; let user; let userThatDidNotCreateChat; let
    admin;

  before(async () => {
    const { group, groupLeader } = await createAndPopulateGroup({
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
    admin = await generateUser({ 'contributor.admin': true });
  });

  context('Chat errors', () => {
    it('returns an error is message does not exist', async () => {
      const fakeChatId = generateUUID();
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

      const returnedMessages = await user.get(`/groups/${groupWithChat._id}/chat/`);
      const messageFromUser = returnedMessages.find(
        returnedMessage => returnedMessage.id === nextMessage.id,
      );

      expect(returnedMessages).is.an('array');
      expect(messageFromUser).to.not.exist;
    });

    it('allows admin to delete another user\'s message', async () => {
      await admin.del(`/groups/${groupWithChat._id}/chat/${nextMessage.id}`);

      const returnedMessages = await user.get(`/groups/${groupWithChat._id}/chat/`);
      const messageFromUser = returnedMessages.find(
        returnedMessage => returnedMessage.id === nextMessage.id,
      );

      expect(returnedMessages).is.an('array');
      expect(messageFromUser).to.not.exist;
    });

    it('returns empty when previous message parameter is passed and the last message was deleted', async () => {
      await expect(user.del(`/groups/${groupWithChat._id}/chat/${nextMessage.id}?previousMsg=${nextMessage.id}`))
        .to.eventually.be.empty;
    });

    it('returns the update chat when previous message parameter is passed and the chat is updated', async () => {
      const updatedChat = await user.del(`/groups/${groupWithChat._id}/chat/${nextMessage.id}?previousMsg=${message.id}`);

      expect(updatedChat[0].id).to.eql(message.id);
    });
  });
});
