import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /members/send-private-message', () => {
  let userToSendMessage;
  let messageToSend = 'Test Private Message';

  beforeEach(async () => {
    userToSendMessage = await generateUser();
  });

  it('returns error when message is not provided', async () => {
    await expect(userToSendMessage.post('/members/send-private-message'))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Invalid request parameters.',
      });
  });

  it('returns error when toUserId is not provided', async () => {
    await expect(userToSendMessage.post('/members/send-private-message', {
      message: messageToSend,
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid request parameters.',
    });
  });

  it('returns error when to user is not found', async () => {
    await expect(userToSendMessage.post('/members/send-private-message', {
      message: messageToSend,
      toUserId: generateUUID(),
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('userNotFound'),
    });
  });

  it('returns error when to user has blocked the sender', async () => {
    let receiver = await generateUser({'inbox.blocks': [userToSendMessage._id]});

    await expect(userToSendMessage.post('/members/send-private-message', {
      message: messageToSend,
      toUserId: receiver._id,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('notAuthorizedToSendMessageToThisUser'),
    });
  });

  it('returns error when sender has blocked to user', async () => {
    let receiver = await generateUser();
    let sender = await generateUser({'inbox.blocks': [receiver._id]});

    await expect(sender.post('/members/send-private-message', {
      message: messageToSend,
      toUserId: receiver._id,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('notAuthorizedToSendMessageToThisUser'),
    });
  });

  it('returns error when to user has opted out of messaging', async () => {
    let receiver = await generateUser({'inbox.optOut': true});

    await expect(userToSendMessage.post('/members/send-private-message', {
      message: messageToSend,
      toUserId: receiver._id,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('notAuthorizedToSendMessageToThisUser'),
    });
  });

  it('returns an error when chat privileges are revoked', async () => {
    let userWithChatRevoked = await generateUser({'flags.chatRevoked': true});
    let receiver = await generateUser();

    await expect(userWithChatRevoked.post('/members/send-private-message', {
      message: messageToSend,
      toUserId: receiver._id,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('chatPrivilegesRevoked'),
    });
  });

  it('sends a private message to a user', async () => {
    let receiver = await generateUser();

    await userToSendMessage.post('/members/send-private-message', {
      message: messageToSend,
      toUserId: receiver._id,
    });

    let updatedReceiver = await receiver.get('/user');
    let updatedSender = await userToSendMessage.get('/user');

    let sendersMessageInReceiversInbox = _.find(updatedReceiver.inbox.messages, (message) => {
      return message.uuid === userToSendMessage._id && message.text === messageToSend;
    });

    let sendersMessageInSendersInbox = _.find(updatedSender.inbox.messages, (message) => {
      return message.uuid === receiver._id && message.text === messageToSend;
    });

    expect(sendersMessageInReceiversInbox).to.exist;
    expect(sendersMessageInSendersInbox).to.exist;
  });

  it('allows admin to send when sender has blocked the admin', async () => {
    userToSendMessage = await generateUser({
      'contributor.admin': 1,
    });
    const receiver = await generateUser({'inbox.blocks': [userToSendMessage._id]});

    await userToSendMessage.post('/members/send-private-message', {
      message: messageToSend,
      toUserId: receiver._id,
    });

    const updatedReceiver = await receiver.get('/user');
    const updatedSender = await userToSendMessage.get('/user');

    const sendersMessageInReceiversInbox = _.find(updatedReceiver.inbox.messages, (message) => {
      return message.uuid === userToSendMessage._id && message.text === messageToSend;
    });

    const sendersMessageInSendersInbox = _.find(updatedSender.inbox.messages, (message) => {
      return message.uuid === receiver._id && message.text === messageToSend;
    });

    expect(sendersMessageInReceiversInbox).to.exist;
    expect(sendersMessageInSendersInbox).to.exist;
  });

  it('allows admin to send when to user has opted out of messaging', async () => {
    userToSendMessage = await generateUser({
      'contributor.admin': 1,
    });
    const receiver = await generateUser({'inbox.optOut': true});

    await userToSendMessage.post('/members/send-private-message', {
      message: messageToSend,
      toUserId: receiver._id,
    });

    const updatedReceiver = await receiver.get('/user');
    const updatedSender = await userToSendMessage.get('/user');

    const sendersMessageInReceiversInbox = _.find(updatedReceiver.inbox.messages, (message) => {
      return message.uuid === userToSendMessage._id && message.text === messageToSend;
    });

    const sendersMessageInSendersInbox = _.find(updatedSender.inbox.messages, (message) => {
      return message.uuid === receiver._id && message.text === messageToSend;
    });

    expect(sendersMessageInReceiversInbox).to.exist;
    expect(sendersMessageInSendersInbox).to.exist;
  });
});
