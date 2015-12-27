import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('POST /chat/:chatId/like', () => {
  let user;
  let api;
  let group;
  let testMessage = 'Test Message';

  before(() => {
    let groupName = 'Test Guild';
    let groupType = 'guild';
    let groupPrivacy = 'public';

    return generateUser({balance: 1}).then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    })
    .then(() => {
      return api.post('/groups', {
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
    return expect(api.post(`/groups/${group._id}/chat/incorrectMessage/like`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageGroupChatNotFound'),
      });
  });

  it('Returns an error when user tries to like their own message', () => {
    return api.post(`/groups/${group._id}/chat`, { message: testMessage})
    .then((result) => {
      return expect(api.post(`/groups/${group._id}/chat/${result.message.id}/like`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('messageGroupChatLikeOwnMessage'),
        });
    });
  });

  it('Likes a chat', () => {
    let api2;
    return generateUser().then((generatedUser) => {
      api2 = requester(generatedUser);
      return api2.post(`/groups/${group._id}/chat`, { message: testMessage});
    })
    .then((result) => {
      return api.post(`/groups/${group._id}/chat/${result.message.id}/like`);
    })
    .then((result) => {
      expect(result.likes[user._id]).to.equal(true);
    });
  });
});
