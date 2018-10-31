import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
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
    // const initialNotifications = receiver.notifications.length;

    const response = await userToSendMessage.post('/members/send-private-message', {
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

    expect(response.message.text).to.deep.equal(sendersMessageInSendersInbox.text);
    expect(response.message.uuid).to.deep.equal(sendersMessageInSendersInbox.uuid);

    // @TODO waiting for mobile support
    // expect(updatedReceiver.notifications.length).to.equal(initialNotifications + 1);
    // const notification = updatedReceiver.notifications[updatedReceiver.notifications.length - 1];

    // expect(notification.type).to.equal('NEW_INBOX_MESSAGE');
    // expect(notification.data.messageId).to.equal(sendersMessageInReceiversInbox.id);
    // expect(notification.data.excerpt).to.equal(messageToSend);
    // expect(notification.data.sender.id).to.equal(updatedSender._id);
    // expect(notification.data.sender.name).to.equal(updatedSender.profile.name);

    expect(sendersMessageInReceiversInbox).to.exist;
    expect(sendersMessageInSendersInbox).to.exist;
  });

  // @TODO waiting for mobile support
  xit('creates a notification with an excerpt if the message is too long', async () => {
    let receiver = await generateUser();
    let longerMessageToSend = 'A very long message, that for sure exceeds the limit of 100 chars for the excerpt that we set to 100 chars';
    let messageExcerpt = `${longerMessageToSend.substring(0, 100)}...`;

    await userToSendMessage.post('/members/send-private-message', {
      message: longerMessageToSend,
      toUserId: receiver._id,
    });

    let updatedReceiver = await receiver.get('/user');

    let sendersMessageInReceiversInbox = _.find(updatedReceiver.inbox.messages, (message) => {
      return message.uuid === userToSendMessage._id && message.text === longerMessageToSend;
    });

    const notification = updatedReceiver.notifications[updatedReceiver.notifications.length - 1];

    expect(notification.type).to.equal('NEW_INBOX_MESSAGE');
    expect(notification.data.messageId).to.equal(sendersMessageInReceiversInbox.id);
    expect(notification.data.excerpt).to.equal(messageExcerpt);
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
