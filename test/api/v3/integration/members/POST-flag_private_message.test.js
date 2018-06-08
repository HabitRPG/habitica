import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /members/flag-private-message/:messageId', () => {
  let userToSendMessage;
  let messageToSend = 'Test Private Message';

  beforeEach(async () => {
    userToSendMessage = await generateUser();
  });

  it('Allows players to flag their own private message', async () => {
    let receiver = await generateUser();

    await userToSendMessage.post('/members/send-private-message', {
      message: messageToSend,
      toUserId: receiver._id,
    });

    let updatedSender = await userToSendMessage.get('/user');

    let sendersMessageInSendersInbox = _.find(updatedSender.inbox.messages, (message) => {
      return message.uuid === receiver._id && message.text === messageToSend;
    });

    expect(sendersMessageInSendersInbox).to.exist;
    await expect(userToSendMessage.post(`/members/flag-private-message/${sendersMessageInSendersInbox.id}`)).to.eventually.be.ok;
  });

  it('Flags a private message', async () => {
    let receiver = await generateUser();

    await userToSendMessage.post('/members/send-private-message', {
      message: messageToSend,
      toUserId: receiver._id,
    });

    let updatedReceiver = await receiver.get('/user');

    let sendersMessageInReceiversInbox = _.find(updatedReceiver.inbox.messages, (message) => {
      return message.uuid === userToSendMessage._id && message.text === messageToSend;
    });

    expect(sendersMessageInReceiversInbox).to.exist;
    await expect(receiver.post(`/members/flag-private-message/${sendersMessageInReceiversInbox.id}`)).to.eventually.be.ok;

  });

  it('Returns an error when user tries to flag a private message that is already flagged', async () => {
    let receiver = await generateUser();

    await userToSendMessage.post('/members/send-private-message', {
      message: messageToSend,
      toUserId: receiver._id,
    });

    let updatedReceiver = await receiver.get('/user');

    let sendersMessageInReceiversInbox = _.find(updatedReceiver.inbox.messages, (message) => {
      return message.uuid === userToSendMessage._id && message.text === messageToSend;
    });

    expect(sendersMessageInReceiversInbox).to.exist;
    await expect(receiver.post(`/members/flag-private-message/${sendersMessageInReceiversInbox.id}`)).to.eventually.be.ok;

    await expect(receiver.post(`/members/flag-private-message/${sendersMessageInReceiversInbox.id}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageGroupChatFlagAlreadyReported'),
      });
  });
});
