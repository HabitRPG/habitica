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

  it('returns error when to user has blocked the sender', async () => {
    let receiverWhoBlocksUser = await generateUser({'inbox.blocks': [userToSendMessage._id]});

    await expect(userToSendMessage.post('/members/transfer-gems', {
      message,
      gemAmount,
      toUserId: receiverWhoBlocksUser._id,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('notAuthorizedToSendMessageToThisUser'),
    });
  });

  it('returns error when sender has blocked to user', async () => {
    let sender = await generateUser({'inbox.blocks': [receiver._id]});

    await expect(sender.post('/members/transfer-gems', {
      message,
      gemAmount,
      toUserId: receiver._id,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('notAuthorizedToSendMessageToThisUser'),
    });
  });

  it('returns an error when chat privileges are revoked', async () => {
    let userWithChatRevoked = await generateUser({'flags.chatRevoked': true});

    await expect(userWithChatRevoked.post('/members/transfer-gems', {
      message,
      gemAmount,
      toUserId: receiver._id,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('chatPrivilegesRevoked'),
    });
  });

  it('works when only the receiver\'s chat privileges are revoked', async () => {
    let receiverWithChatRevoked = await generateUser({'flags.chatRevoked': true});

    await expect(userToSendMessage.post('/members/transfer-gems', {
      message,
      gemAmount,
      toUserId: receiverWithChatRevoked._id,
    })).to.eventually.be.fulfilled;

    let updatedReceiver = await receiverWithChatRevoked.get('/user');
    let updatedSender = await userToSendMessage.get('/user');

    expect(updatedReceiver.balance).to.equal(gemAmount / 4);
    expect(updatedSender.balance).to.equal(0);
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

    let messageSentContent = t('privateMessageGiftIntro', {
      receiverName: receiver.profile.name,
      senderName: userToSendMessage.profile.name,
    });
    messageSentContent += t('privateMessageGiftGemsMessage', {gemAmount});
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

    let messageSentContent = t('privateMessageGiftIntro', {
      receiverName: receiver.profile.name,
      senderName: userToSendMessage.profile.name,
    });
    messageSentContent += t('privateMessageGiftGemsMessage', {gemAmount});
    messageSentContent =  `\`${messageSentContent}\` `;

    expect(sendersMessageInReceiversInbox).to.exist;
    expect(sendersMessageInReceiversInbox.text).to.equal(messageSentContent);
    expect(updatedReceiver.balance).to.equal(gemAmount / 4);

    expect(sendersMessageInSendersInbox).to.exist;
    expect(sendersMessageInSendersInbox.text).to.equal(messageSentContent);
    expect(updatedSender.balance).to.equal(0);
  });
});
