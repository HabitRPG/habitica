import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';
import { find } from 'lodash';

describe('POST /chat/:chatId/flag', () => {
  let user, group;
  const TEST_MESSAGE = 'Test Message';

  before(async () => {
    user = await generateUser({balance: 1});
    group = await user.post('/groups', {
      name: 'Test Guild',
      type: 'guild',
      privacy: 'public',
    });
  });

  it('Returns an error when chat message is not found', async () => {
    return expect(user.post(`/groups/${group._id}/chat/incorrectMessage/flag`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageGroupChatNotFound'),
      });
  });

  it('Returns an error when user tries to flag their own message', async () => {
    return user.post(`/groups/${group._id}/chat`, { message: TEST_MESSAGE})
    .then((result) => {
      return expect(user.post(`/groups/${group._id}/chat/${result.message.id}/flag`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('messageGroupChatFlagOwnMessage'),
        });
    });
  });

  it('Flags a chat', async () => {
    let message;

    return generateUser().then((anotherUser) => {
      return anotherUser.post(`/groups/${group._id}/chat`, { message: TEST_MESSAGE});
    })
    .then((result) => {
      message = result.message;
      return user.post(`/groups/${group._id}/chat/${message.id}/flag`);
    })
    .then((result) => {
      expect(result.flags[user._id]).to.equal(true);
      expect(result.flagCount).to.equal(1);
      return user.get(`/groups/${group._id}`);
    })
    .then((updatedGroup) => {
      let messageToCheck = find(updatedGroup.chat, {id: message.id});
      expect(messageToCheck.flags[user._id]).to.equal(true);
    });
  });

  it('Flags a chat with a higher flag acount when an admin flags the message', async () => {
    let secondUser;
    let message;

    return generateUser({'contributor.admin': true}).then((generatedUser) => {
      secondUser = generatedUser;
      return user.post(`/groups/${group._id}/chat`, { message: TEST_MESSAGE});
    })
    .then((result) => {
      message = result.message;
      return secondUser.post(`/groups/${group._id}/chat/${message.id}/flag`);
    })
    .then((result) => {
      expect(result.flags[secondUser._id]).to.equal(true);
      expect(result.flagCount).to.equal(5);
      return user.get(`/groups/${group._id}`);
    })
    .then((updatedGroup) => {
      let messageToCheck = find(updatedGroup.chat, {id: message.id});
      expect(messageToCheck.flags[secondUser._id]).to.equal(true);
      expect(messageToCheck.flagCount).to.equal(5);
    });
  });

  it('Returns an error when user tries to flag a message that is already flagged', async () => {
    let message;

    return generateUser().then((anotherUser) => {
      return anotherUser.post(`/groups/${group._id}/chat`, { message: TEST_MESSAGE});
    })
    .then((result) => {
      message = result.message;
      return user.post(`/groups/${group._id}/chat/${message.id}/flag`);
    })
    .then(() => {
      return expect(user.post(`/groups/${group._id}/chat/${message.id}/flag`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('messageGroupChatFlagAlreadyReported'),
        });
    });
  });
});
