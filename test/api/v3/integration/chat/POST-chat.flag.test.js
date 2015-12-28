import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';
import _ from 'lodash';

describe('POST /chat/:chatId/flag', () => {
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
    return expect(api.post(`/groups/${group._id}/chat/incorrectMessage/flag`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageGroupChatNotFound'),
      });
  });

  it('Returns an error when user tries to flag their own message', () => {
    return api.post(`/groups/${group._id}/chat`, { message: testMessage})
    .then((result) => {
      return expect(api.post(`/groups/${group._id}/chat/${result.message.id}/flag`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('messageGroupChatFlagOwnMessage'),
        });
    });
  });

  it('Flags a chat', () => {
    let api2;
    let message;

    return generateUser().then((generatedUser) => {
      api2 = requester(generatedUser);
      return api2.post(`/groups/${group._id}/chat`, { message: testMessage});
    })
    .then((result) => {
      message = result.message;
      return api.post(`/groups/${group._id}/chat/${message.id}/flag`);
    })
    .then((result) => {
      expect(result.flags[user._id]).to.equal(true);
      expect(result.flagCount).to.equal(1);
      return api.get(`/groups/${group._id}`);
    })
    .then((updatedGroup) => {
      let messageToCheck = _.find(updatedGroup.chat, {id: message.id});
      expect(messageToCheck.flags[user._id]).to.equal(true);
    });
  });

  it('Flags a chat with a higher flag acount when an admin flags the message', () => {
    let api2;
    let secondUser;
    let message;

    return generateUser({'contributor.admin': true}).then((generatedUser) => {
      secondUser = generatedUser;
      api2 = requester(generatedUser);
      return api.post(`/groups/${group._id}/chat`, { message: testMessage});
    })
    .then((result) => {
      message = result.message;
      return api2.post(`/groups/${group._id}/chat/${message.id}/flag`);
    })
    .then((result) => {
      expect(result.flags[secondUser._id]).to.equal(true);
      expect(result.flagCount).to.equal(5);
      return api.get(`/groups/${group._id}`);
    })
    .then((updatedGroup) => {
      let messageToCheck = _.find(updatedGroup.chat, {id: message.id});
      expect(messageToCheck.flags[secondUser._id]).to.equal(true);
      expect(messageToCheck.flagCount).to.equal(5);
    });
  });

  it('Returns an error when user tries to flag a message that is already flagged', () => {
    let api2;
    let message;

    return generateUser().then((generatedUser) => {
      api2 = requester(generatedUser);
      return api2.post(`/groups/${group._id}/chat`, { message: testMessage});
    })
    .then((result) => {
      message = result.message;
      return api.post(`/groups/${group._id}/chat/${message.id}/flag`);
    })
    .then(() => {
      return expect(api.post(`/groups/${group._id}/chat/${message.id}/flag`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('messageGroupChatFlagAlreadyReported'),
        });
    });
  });
});
