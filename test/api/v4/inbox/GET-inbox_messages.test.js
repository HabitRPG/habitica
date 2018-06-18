import {
  generateUser,
} from '../../../helpers/api-integration/v4';

describe('GET /inbox/messages', () => {
  let user;
  let otherUser;

  before(async () => {
    [user, otherUser] = await Promise.all([generateUser(), generateUser()]);

    await otherUser.post('/members/send-private-message', {
      toUserId: user.id,
      message: 'first',
    });
    await user.post('/members/send-private-message', {
      toUserId: otherUser.id,
      message: 'second',
    });
    await otherUser.post('/members/send-private-message', {
      toUserId: user.id,
      message: 'third',
    });

    await user.sync();
  });

  it('returns the user inbox messages as an array of ordered messages (from most to least recent)', async () => {
    const messages = await user.get('/inbox/messages');

    expect(messages.length).to.equal(3);
    expect(messages.length).to.equal(Object.keys(user.inbox.messages).length);

    expect(messages[0].text).to.equal('third');
    expect(messages[1].text).to.equal('second');
    expect(messages[2].text).to.equal('first');
  });
});