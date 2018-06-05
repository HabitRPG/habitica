import {
  generateUser,
} from '../../../../helpers/api-v3-integration.helper';

describe('GET /inbox/messages', () => {
  let user;

  before(async () => {
    let otherUser = await generateUser({
      'profile.name': 'Other User',
    });
    user = await generateUser({
      'profile.name': 'Main User',
    });

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

  it('returns the user inbox messages as an array of ordered messages', async () => {
    const messages = await user.get('/inbox/messages');

    expect(messages.length).to.equal(3);
    expect(messages.length).to.equal(Object.keys(user.inbox.messages).length);

    expect(messages[0].text).to.equal('first');
    expect(messages[1].text).to.equal('second');
    expect(messages[2].text).to.equal('third');
  });
});
