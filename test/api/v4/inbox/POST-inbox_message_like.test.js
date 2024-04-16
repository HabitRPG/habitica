import find from 'lodash/find';
import {
  generateUser,
  translate as t,
} from '../../../helpers/api-integration/v4';

/**
 * Checks the messages array if the uniqueMessageId has the like flag
 * @param {InboxMessage[]} messages
 * @param {String} uniqueMessageId
 * @param {String} userId
 * @param {Boolean} likeStatus
 */
function expectMessagesLikeStatus (messages, uniqueMessageId, userId, likeStatus) {
  const messageToCheck = find(messages, { uniqueMessageId });

  expect(messageToCheck.likes[userId]).to.equal(likeStatus);
}

// eslint-disable-next-line mocha/no-exclusive-tests
describe('POST /inbox/like-private-message/:messageId', () => {
  let userToSendMessage;
  const getLikeUrl = messageId => `/inbox/like-private-message/${messageId}`;

  before(async () => {
    userToSendMessage = await generateUser();
  });

  it('Returns an error when private message is not found', async () => {
    await expect(userToSendMessage.post(getLikeUrl('some-unknown-id')))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageGroupChatNotFound'),
      });
  });

  it('Likes a message', async () => {
    const receiver = await generateUser();

    const sentMessageResult = await userToSendMessage.post('/members/send-private-message', {
      message: 'some message :)',
      toUserId: receiver._id,
    });

    const { uniqueMessageId } = sentMessageResult.message;

    const likeResult = await receiver.post(getLikeUrl(uniqueMessageId));
    expect(likeResult.likes[receiver._id]).to.equal(true);

    const senderMessages = await userToSendMessage.get('/inbox/messages');

    expectMessagesLikeStatus(senderMessages, uniqueMessageId, receiver._id, true);

    const receiversMessages = await receiver.get('/inbox/messages');

    expectMessagesLikeStatus(receiversMessages, uniqueMessageId, receiver._id, true);
  });

  it('Allows to likes their own private message', async () => {
    const receiver = await generateUser();

    const sentMessageResult = await userToSendMessage.post('/members/send-private-message', {
      message: 'some message :)',
      toUserId: receiver._id,
    });

    const { uniqueMessageId } = sentMessageResult.message;

    const likeResult = await userToSendMessage.post(getLikeUrl(uniqueMessageId));
    expect(likeResult.likes[userToSendMessage._id]).to.equal(true);

    const messages = await userToSendMessage.get('/inbox/messages');
    expectMessagesLikeStatus(messages, uniqueMessageId, userToSendMessage._id, true);

    const receiversMessages = await receiver.get('/inbox/messages');

    expectMessagesLikeStatus(receiversMessages, uniqueMessageId, userToSendMessage._id, true);
  });

  it('Unlikes a message', async () => {
    const receiver = await generateUser();

    const sentMessageResult = await userToSendMessage.post('/members/send-private-message', {
      message: 'some message :)',
      toUserId: receiver._id,
    });

    const { uniqueMessageId } = sentMessageResult.message;

    const likeResult = await receiver.post(getLikeUrl(uniqueMessageId));

    expect(likeResult.likes[receiver._id]).to.equal(true);

    const unlikeResult = await receiver.post(getLikeUrl(uniqueMessageId));

    expect(unlikeResult.likes[receiver._id]).to.equal(false);

    const messages = await userToSendMessage.get('/inbox/messages');

    const messageToCheck = find(messages, { id: sentMessageResult.message.id });
    expect(messageToCheck.likes[receiver._id]).to.equal(false);
  });
});
