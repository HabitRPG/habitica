import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('GET /inbox/messages', () => {
  let user;
  let otherUser;

  beforeEach(async () => {
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

    // message to yourself
    await user.post('/members/send-private-message', {
      toUserId: user.id,
      message: 'fourth',
    });
  });

  it('returns the user inbox messages as an array of ordered messages (from most to least recent)', async () => {
    const messages = await user.get('/inbox/messages');

    expect(messages.length).to.equal(4);

    // message to yourself
    expect(messages[0].text).to.equal('fourth');
    expect(messages[0].sent).to.equal(false);
    expect(messages[0].uuid).to.equal(user._id);

    expect(messages[1].text).to.equal('third');
    expect(messages[2].text).to.equal('second');
    expect(messages[3].text).to.equal('first');
  });

  it('returns four messages when using page-query ', async () => {
    const promises = [];

    for (let i = 0; i < 10; i += 1) {
      promises.push(user.post('/members/send-private-message', {
        toUserId: user.id,
        message: 'fourth',
      }));
    }

    await Promise.all(promises);

    const messages = await user.get('/inbox/messages?page=1');

    expect(messages.length).to.equal(4);
  });

  it('returns only the messages of one conversation', async () => {
    const messages = await user.get(`/inbox/messages?conversation=${otherUser.id}`);

    expect(messages.length).to.equal(3);
  });
});
