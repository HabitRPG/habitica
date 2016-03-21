import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /send-private-message', () => {
  let userToSendMessage;
  let messageToSend = { message: 'Test Private Message' };

  beforeEach(async () => {
    userToSendMessage = await generateUser();
  });

  it('returns error when message is not provided', async () => {
    await expect(userToSendMessage.post('/send-private-message'))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Invalid request parameters.',
      });
  });

  it('returns error when toUserId is not provided', async () => {
    await expect(userToSendMessage.post('/send-private-message', {
      message: messageToSend,
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid request parameters.',
    });
  });

  it('returns error when to user is not found', async () => {
    await expect(userToSendMessage.post('/send-private-message', {
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

    await expect(userToSendMessage.post('/send-private-message', {
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

    await expect(sender.post('/send-private-message', {
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

    await expect(userToSendMessage.post('/send-private-message', {
      message: messageToSend,
      toUserId: receiver._id,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('notAuthorizedToSendMessageToThisUser'),
    });
  });

  it('sends a private message to a user', async () => {
    let receiver = await generateUser();

    await userToSendMessage.post('/send-private-message', {
      message: messageToSend,
      toUserId: receiver._id,
    });

    let updatedReceiver = await receiver.get('/user');
    let updatedSender = await userToSendMessage.get('/user');

    let sendersMessageInReceiversInbox = _.find(updatedReceiver.inbox.messages, (message) => {
      return message.uuid === userToSendMessage._id && message.text === messageToSend.message;
    });

    let sendersMessageInSendersInbox = _.find(updatedSender.inbox.messages, (message) => {
      return message.uuid === receiver._id && message.text === messageToSend.message;
    });

    expect(sendersMessageInReceiversInbox).to.exist;
    expect(sendersMessageInSendersInbox).to.exist;
  });

  it('sends a private message about gems to a user', async () => {
    let receiver = await generateUser();
    let messageAboutGemsToSend = {
      type: 'gems',
      gems: {
        amount: 2,
      },
      message: 'Test Message About Gems',
    };

    await userToSendMessage.post('/send-private-message', {
      message: messageAboutGemsToSend,
      toUserId: receiver._id,
    });

    let updatedReceiver = await receiver.get('/user');
    let updatedSender = await userToSendMessage.get('/user');

    let sendersMessageInReceiversInbox = _.find(updatedReceiver.inbox.messages, (message) => {
      return message.uuid === userToSendMessage._id;
    });

    let sendersMessageInSendersInbox = _.find(updatedSender.inbox.messages, (message) => {
      return message.uuid === receiver._id;
    });

    expect(sendersMessageInReceiversInbox).to.exist;
    expect(sendersMessageInReceiversInbox.text).to.equal(`Hello ${receiver.profile.name}, ${userToSendMessage.profile.name} has sent you ${messageAboutGemsToSend.gems.amount} gems! ${messageAboutGemsToSend.message}`);
    expect(sendersMessageInSendersInbox).to.exist;
    expect(sendersMessageInSendersInbox.text).to.equal(`Hello ${receiver.profile.name}, ${userToSendMessage.profile.name} has sent you ${messageAboutGemsToSend.gems.amount} gems! ${messageAboutGemsToSend.message}`);
  });

  it('sends a private message about subscriptions to a user', async () => {
    let receiver = await generateUser();
    let messageAboutSubscriptionToSend = {
      type: 'subscription',
      subscription: {
        key: 'basic_12mo',
      },
      message: 'Test Message About Subscription',
    };

    await userToSendMessage.post('/send-private-message', {
      message: messageAboutSubscriptionToSend,
      toUserId: receiver._id,
    });

    let updatedReceiver = await receiver.get('/user');
    let updatedSender = await userToSendMessage.get('/user');

    let sendersMessageInReceiversInbox = _.find(updatedReceiver.inbox.messages, (message) => {
      return message.uuid === userToSendMessage._id;
    });

    let sendersMessageInSendersInbox = _.find(updatedSender.inbox.messages, (message) => {
      return message.uuid === receiver._id;
    });

    expect(sendersMessageInReceiversInbox).to.exist;
    expect(sendersMessageInReceiversInbox.text).to.equal(`Hello ${receiver.profile.name}, ${userToSendMessage.profile.name} has sent you 12 months of subscription! ${messageAboutSubscriptionToSend.message}`);
    expect(sendersMessageInSendersInbox).to.exist;
    expect(sendersMessageInSendersInbox.text).to.equal(`Hello ${receiver.profile.name}, ${userToSendMessage.profile.name} has sent you 12 months of subscription! ${messageAboutSubscriptionToSend.message}`);
  });
});
