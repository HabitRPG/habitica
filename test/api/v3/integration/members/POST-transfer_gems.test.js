import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /members/transfer-gems', () => {
  let userToSendMessage;
  let receiver;
  let message = 'Test Private Message';
  let gemAmount = 20;

  beforeEach(async () => {
    userToSendMessage = await generateUser({balance: 5});
    receiver = await generateUser();
  });

  it('returns error when no parameters are provided', async () => {
    await expect(userToSendMessage.post('/members/transfer-gems'))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Invalid request parameters.',
      });
  });

  it('returns error when toUserId is not provided', async () => {
    await expect(userToSendMessage.post('/members/transfer-gems', {
      message,
      gemAmount,
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid request parameters.',
    });
  });

  it('returns error when to user is not found', async () => {
    await expect(userToSendMessage.post('/members/transfer-gems', {
      message,
      gemAmount,
      toUserId: generateUUID(),
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('userNotFound'),
    });
  });

  it('returns error when to user attempts to send gems to themselves', async () => {
    await expect(userToSendMessage.post('/members/transfer-gems', {
      message,
      gemAmount,
      toUserId: userToSendMessage._id,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('cannotSendGemsToYourself'),
    });
  });

  it('returns error when there is no gemAmount', async () => {
    await expect(userToSendMessage.post('/members/transfer-gems', {
      message,
      toUserId: receiver._id,
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid request parameters.',
    });
  });

  it('returns error when gemAmount is not an integer', async () => {
    await expect(userToSendMessage.post('/members/transfer-gems', {
      message,
      gemAmount: 1.5,
      toUserId: receiver._id,
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid request parameters.',
    });
  });

  it('returns error when gemAmount is negative', async () => {
    await expect(userToSendMessage.post('/members/transfer-gems', {
      message,
      gemAmount: -5,
      toUserId: receiver._id,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('badAmountOfGemsToSend'),
    });
  });

  it('returns error when gemAmount is more than the sender\'s balance', async () => {
    await expect(userToSendMessage.post('/members/transfer-gems', {
      message,
      gemAmount: gemAmount + 4,
      toUserId: receiver._id,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('badAmountOfGemsToSend'),
    });
  });

  it('sends a private message about gems to a user', async () => {
    await userToSendMessage.post('/members/transfer-gems', {
      message,
      gemAmount,
      toUserId: receiver._id,
    });

    let updatedReceiver = await receiver.get('/user');
    let updatedSender = await userToSendMessage.get('/user');

    let sendersMessageInReceiversInbox = _.find(updatedReceiver.inbox.messages, (inboxMessage) => {
      return inboxMessage.uuid === userToSendMessage._id;
    });

    let sendersMessageInSendersInbox = _.find(updatedSender.inbox.messages, (inboxMessage) => {
      return inboxMessage.uuid === receiver._id;
    });

    let messageSentContent = t('privateMessageGiftGemsMessage', {
      receiverName: receiver.profile.name,
      senderName: userToSendMessage.profile.name,
      gemAmount: gemAmount
    });
    messageSentContent =  `\`${messageSentContent}\` `;
    messageSentContent += message;

    expect(sendersMessageInReceiversInbox).to.exist;
    expect(sendersMessageInReceiversInbox.text).to.equal(messageSentContent);
    expect(updatedReceiver.balance).to.equal(gemAmount / 4);

    expect(sendersMessageInSendersInbox).to.exist;
    expect(sendersMessageInSendersInbox.text).to.equal(messageSentContent);
    expect(updatedSender.balance).to.equal(0);
  });

  it('does not requrie a message', async () => {
    await userToSendMessage.post('/members/transfer-gems', {
      gemAmount,
      toUserId: receiver._id,
    });

    let updatedReceiver = await receiver.get('/user');
    let updatedSender = await userToSendMessage.get('/user');

    let sendersMessageInReceiversInbox = _.find(updatedReceiver.inbox.messages, (inboxMessage) => {
      return inboxMessage.uuid === userToSendMessage._id;
    });

    let sendersMessageInSendersInbox = _.find(updatedSender.inbox.messages, (inboxMessage) => {
      return inboxMessage.uuid === receiver._id;
    });

    let messageSentContent = t('privateMessageGiftGemsMessage', {
      receiverName: receiver.profile.name,
      senderName: userToSendMessage.profile.name,
      gemAmount: gemAmount
    });
    messageSentContent =  `\`${messageSentContent}\` `;

    expect(sendersMessageInReceiversInbox).to.exist;
    expect(sendersMessageInReceiversInbox.text).to.equal(messageSentContent);
    expect(updatedReceiver.balance).to.equal(gemAmount / 4);

    expect(sendersMessageInSendersInbox).to.exist;
    expect(sendersMessageInSendersInbox.text).to.equal(messageSentContent);
    expect(updatedSender.balance).to.equal(0);
  });
});
