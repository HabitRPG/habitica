import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';
import _ from 'lodash';

describe('POST /chat/:chatId/like', () => {
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
    return expect(user.post(`/groups/${group._id}/chat/incorrectMessage/like`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageGroupChatNotFound'),
      });
  });

  it('Returns an error when user tries to like their own message', () => {
    return user.post(`/groups/${group._id}/chat`, { message: testMessage})
    .then((result) => {
      return expect(user.post(`/groups/${group._id}/chat/${result.message.id}/like`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('messageGroupChatLikeOwnMessage'),
        });
    });
  });

  it('Likes a chat', () => {
    let message;

    return generateUser().then((anotherUser) => {
      return anotherUser.post(`/groups/${group._id}/chat`, { message: testMessage});
    })
    .then((result) => {
      message = result.message;
      return user.post(`/groups/${group._id}/chat/${message.id}/like`);
    })
    .then((result) => {
      expect(result.likes[user._id]).to.equal(true);
      return user.get(`/groups/${group._id}`);
    })
    .then((updatedGroup) => {
      let messageToCheck = _.find(updatedGroup.chat, {id: message.id});
      expect(messageToCheck.likes[user._id]).to.equal(true);
    });
  });

  it('Unlikes a chat', () => {
    let message;

    return generateUser().then((anotherUser) => {
      return anotherUser.post(`/groups/${group._id}/chat`, { message: testMessage});
    })
    .then((result) => {
      message = result.message;
      return user.post(`/groups/${group._id}/chat/${message.id}/like`);
    })
    .then((result) => {
      expect(result.likes[user._id]).to.equal(true);
      return user.post(`/groups/${group._id}/chat/${message.id}/like`);
    })
    .then((result) => {
      expect(result.likes[user._id]).to.equal(false);
      return user.get(`/groups/${group._id}`);
    })
    .then((updatedGroup) => {
      let messageToCheck = _.find(updatedGroup.chat, {id: message.id});
      expect(messageToCheck.likes[user._id]).to.equal(false);
    });
  });
});
