import { find } from 'lodash';
import {
  generateUser,
  translate as t,
} from '../../../helpers/api-integration/v4';

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

  it('Returns an error when user tries to like their own message', async () => {
    const receiver = await generateUser();

    await userToSendMessage.post('/members/send-private-message', {
      message: 'some message :)',
      toUserId: receiver._id,
    });

    const allMessages = await userToSendMessage.get('/inbox/messages');

    await expect(userToSendMessage.post(getLikeUrl(allMessages[0].id)))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('messageGroupChatLikeOwnMessage'),
      });
  });

  it('Likes a message', async () => {
    const receiver = await generateUser();

    const sentMessage = await userToSendMessage.post('/members/send-private-message', {
      message: 'some message :)',
      toUserId: receiver._id,
    });

    const receiversMessages = await receiver.get('/inbox/messages');

    const likeResult = await receiver.post(getLikeUrl(receiversMessages[0].id));

    expect(likeResult.likes[receiver._id]).to.equal(true);

    const messages = await userToSendMessage.get('/inbox/messages');

    const messageToCheck = find(messages, { id: sentMessage.message.id });
    expect(messageToCheck.likes[receiver._id]).to.equal(true);
  });

  it('Unlikes a message', async () => {
    const receiver = await generateUser();

    const sentMessage = await userToSendMessage.post('/members/send-private-message', {
      message: 'some message :)',
      toUserId: receiver._id,
    });

    const receiversMessages = await receiver.get('/inbox/messages');

    const likeResult = await receiver.post(getLikeUrl(receiversMessages[0].id));

    expect(likeResult.likes[receiver._id]).to.equal(true);

    const unlikeResult = await receiver.post(getLikeUrl(receiversMessages[0].id));

    expect(unlikeResult.likes[receiver._id]).to.equal(false);

    const messages = await userToSendMessage.get('/inbox/messages');

    const messageToCheck = find(messages, { id: sentMessage.message.id });
    expect(messageToCheck.likes[receiver._id]).to.equal(false);
  });
});
