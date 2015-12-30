import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('POST /chat', () => {
  let user;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
    });
  });

  it('Returns an error when no message is provided', () => {
    let groupName = 'Test Guild';
    let groupType = 'guild';
    let groupPrivacy = 'public';
    let testMessage = '';

    return generateUser({balance: 1}).then((anotherUser) => {
      return anotherUser.post('/groups', {
        name: groupName,
        type: groupType,
        privacy: groupPrivacy,
      });
    })
    .then((group) => {
      return expect(user.post(`/groups/${group._id}/chat`, { message: testMessage}))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: t('invalidReqParams'),
        });
    });
  });

  it('Returns an error when group is not found', () => {
    let testMessage = 'Test Message';
    return expect(user.post('/groups/nvalidID/chat', { message: testMessage})).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
  });

  it('Returns an error when chat privileges are revoked', () => {
    let groupName = 'Test Guild';
    let groupType = 'guild';
    let groupPrivacy = 'public';
    let testMessage = 'Test Message';
    let userWithoutChat;

    return generateUser({balance: 1, 'flags.chatRevoked': true}).then((generatedUser) => {
      userWithoutChat = generatedUser;

      return userWithoutChat.post('/groups', {
        name: groupName,
        type: groupType,
        privacy: groupPrivacy,
      });
    })
    .then((group) => {
      return expect(userWithoutChat.post(`/groups/${group._id}/chat`, { message: testMessage})).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: 'Your chat privileges have been revoked.',
      });
    });
  });

  it('creates a chat', () => {
    let groupName = 'Test Guild';
    let groupType = 'guild';
    let groupPrivacy = 'public';
    let testMessage = 'Test Message';
    let anotherUser;

    return generateUser({balance: 1}).then((generatedUser) => {
      anotherUser = generatedUser;

      return anotherUser.post('/groups', {
        name: groupName,
        type: groupType,
        privacy: groupPrivacy,
      });
    })
    .then((group) => {
      return anotherUser.post(`/groups/${group._id}/chat`, { message: testMessage});
    })
    .then((result) => {
      expect(result.message.id).to.exist;
    });
  });
});
