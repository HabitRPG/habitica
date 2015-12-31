import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';
import { find } from 'lodash';

describe('POST /chat/:chatId/flag', () => {
  let user;
  let group;
  let testMessage = 'Test Message';

  before(() => {
    let groupName = 'Test Guild';
    let groupType = 'guild';
    let groupPrivacy = 'public';

    return generateUser({balance: 1}).then((generatedUser) => {
      user = generatedUser;
    })
    .then(() => {
      return user.post('/groups', {
        name: groupName,
        type: groupType,
        privacy: groupPrivacy,
      });
    })
    .then((generatedGroup) => {
      group = generatedGroup;
    });
  });

  it('Returns an error when chat message is not found', () => {
    return expect(user.post(`/groups/${group._id}/chat/incorrectMessage/flag`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageGroupChatNotFound'),
      });
  });

  it('Returns an error when user tries to flag their own message', () => {
    return user.post(`/groups/${group._id}/chat`, { message: testMessage})
    .then((result) => {
      return expect(user.post(`/groups/${group._id}/chat/${result.message.id}/flag`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('messageGroupChatFlagOwnMessage'),
        });
    });
  });

  it('Flags a chat', () => {
    let message;

    return generateUser().then((anotherUser) => {
      return anotherUser.post(`/groups/${group._id}/chat`, { message: testMessage});
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

  it('Flags a chat with a higher flag acount when an admin flags the message', () => {
    let secondUser;
    let message;

    return generateUser({'contributor.admin': true}).then((generatedUser) => {
      secondUser = generatedUser;
      return user.post(`/groups/${group._id}/chat`, { message: testMessage});
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

  it('Returns an error when user tries to flag a message that is already flagged', () => {
    let message;

    return generateUser().then((anotherUser) => {
      return anotherUser.post(`/groups/${group._id}/chat`, { message: testMessage});
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
