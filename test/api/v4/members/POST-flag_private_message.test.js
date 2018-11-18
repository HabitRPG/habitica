import {
  generateUser,
  translate as t,
} from '../../../helpers/api-integration/v4';

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

    let senderMessages = await userToSendMessage.get('/inbox/messages');

    let sendersMessageInSendersInbox = _.find(senderMessages, (message) => {
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

    let receiversMessages = await receiver.get('/inbox/messages');

    let sendersMessageInReceiversInbox = _.find(receiversMessages, (message) => {
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

    let receiversMessages = await receiver.get('/inbox/messages');

    let sendersMessageInReceiversInbox = _.find(receiversMessages, (message) => {
      return message.uuid === userToSendMessage._id && message.text === messageToSend;
    });

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
