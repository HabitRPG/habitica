import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('POST /chat', () => {
  let user;
  let api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  it('Returns an error when no message is provided', () => {
    let groupName = 'Test Guild';
    let groupType = 'guild';
    let groupPrivacy = 'public';
    let testMessage = '';
    let api2;

    return generateUser({balance: 1}).then((generatedUser) => {
      api2 = requester(generatedUser);
      return api2.post('/groups', {
        name: groupName,
        type: groupType,
        privacy: groupPrivacy,
      });
    })
    .then((group) => {
      return expect(api.post(`/groups/${group._id}/chat`, { message: testMessage}))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: t('invalidReqParams'),
        });
    });
  });

  it('Returns an error when group is not found', () => {
    let testMessage = 'Test Message';
    return expect(api.post('/groups/nvalidID/chat', { message: testMessage})).to.eventually.be.rejected.and.eql({
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
    let api2;

    return generateUser({balance: 1, 'flags.chatRevoked': true}).then((generatedUser) => {
      api2 = requester(generatedUser);
      return api2.post('/groups', {
        name: groupName,
        type: groupType,
        privacy: groupPrivacy,
      });
    })
    .then((group) => {
      return expect(api2.post(`/groups/${group._id}/chat`, { message: testMessage})).to.eventually.be.rejected.and.eql({
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
    let api2;

    return generateUser({balance: 1}).then((generatedUser) => {
      api2 = requester(generatedUser);
      return api2.post('/groups', {
        name: groupName,
        type: groupType,
        privacy: groupPrivacy,
      });
    })
    .then((group) => {
      return api2.post(`/groups/${group._id}/chat`, { message: testMessage});
    })
    .then((result) => {
      expect(result.message.id).to.exist;
    });
  });
});
