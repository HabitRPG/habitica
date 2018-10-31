import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('DELETE user message', () => {
  let user, messagesId, otherUser;

  before(async () => {
    [user, otherUser] = await Promise.all([generateUser(), generateUser()]);
    await user.post('/members/send-private-message', {
      toUserId: otherUser.id,
      message: 'first',
    });
    await user.post('/members/send-private-message', {
      toUserId: otherUser.id,
      message: 'second',
    });

    let userRes = await user.get('/user');

    messagesId = Object.keys(userRes.inbox.messages);
    expect(messagesId.length).to.eql(2);
    expect(userRes.inbox.messages[messagesId[0]].text).to.eql('second');
    expect(userRes.inbox.messages[messagesId[1]].text).to.eql('first');
  });

  it('one message', async () => {
    let result = await user.del(`/user/messages/${messagesId[0]}`);
    messagesId = Object.keys(result);
    expect(messagesId.length).to.eql(1);

    let userRes = await user.get('/user');
    expect(Object.keys(userRes.inbox.messages).length).to.eql(1);
    expect(userRes.inbox.messages[messagesId[0]].text).to.eql('first');
  });

  it('clear all', async () => {
    let result = await user.del('/user/messages');
    let userRes = await user.get('/user');
    expect(userRes.inbox.messages).to.eql({});
    expect(result).to.eql({});
  });
});
