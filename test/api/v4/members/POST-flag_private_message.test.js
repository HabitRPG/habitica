import {
  generateUser,
  translate as t,
} from '../../../helpers/api-integration/v4';

describe('POST /members/flag-private-message/:messageId', () => {
  let userToSendMessage;
  const messageToSend = 'Test Private Message';

  beforeEach(async () => {
    userToSendMessage = await generateUser();
  });

  it('Allows players to flag their own private message', async () => {
    const receiver = await generateUser();

    await userToSendMessage.post('/members/send-private-message', {
      message: messageToSend,
      toUserId: receiver._id,
    });

    const senderMessages = await userToSendMessage.get('/inbox/paged-messages');

    const sendersMessageInSendersInbox = _.find(
      senderMessages,
      message => message.toUUID === receiver._id && message.text === messageToSend,
    );

    expect(sendersMessageInSendersInbox).to.exist;
    await expect(userToSendMessage.post(`/members/flag-private-message/${sendersMessageInSendersInbox.id}`)).to.eventually.be.ok;
  });

  it('Flags a private message', async () => {
    const receiver = await generateUser();

    await userToSendMessage.post('/members/send-private-message', {
      message: messageToSend,
      toUserId: receiver._id,
    });

    const receiversMessages = await receiver.get('/inbox/paged-messages');

    const sendersMessageInReceiversInbox = _.find(
      receiversMessages,
      message => message.uuid === userToSendMessage._id && message.text === messageToSend,
    );

    expect(sendersMessageInReceiversInbox).to.exist;
    await expect(receiver.post(`/members/flag-private-message/${sendersMessageInReceiversInbox.id}`)).to.eventually.be.ok;
  });

  it('Returns an error when user tries to flag a private message that is already flagged', async () => {
    const receiver = await generateUser();

    await userToSendMessage.post('/members/send-private-message', {
      message: messageToSend,
      toUserId: receiver._id,
    });

    const receiversMessages = await receiver.get('/inbox/paged-messages');

    const sendersMessageInReceiversInbox = _.find(
      receiversMessages,
      message => message.uuid === userToSendMessage._id && message.text === messageToSend,
    );

    expect(sendersMessageInReceiversInbox).to.exist;
    await expect(receiver.post(`/members/flag-private-message/${sendersMessageInReceiversInbox.id}`)).to.eventually.be.ok;

    await expect(receiver.post(`/members/flag-private-message/${sendersMessageInReceiversInbox.id}`))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('messageGroupChatFlagAlreadyReported'),
      });
  });
});
