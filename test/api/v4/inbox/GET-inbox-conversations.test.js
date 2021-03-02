import {
  generateUser,
} from '../../../helpers/api-integration/v4';

describe('GET /inbox/conversations', () => {
  let user;
  let otherUser;
  let thirdUser;

  beforeEach(async () => {
    [user, otherUser, thirdUser] = await Promise.all([
      generateUser(),
      generateUser(),
      generateUser(),
    ]);

    await otherUser.post('/members/send-private-message', {
      toUserId: user.id,
      message: 'first',
    });
    await user.post('/members/send-private-message', {
      toUserId: otherUser.id,
      message: 'second',
    });
    await user.post('/members/send-private-message', {
      toUserId: thirdUser.id,
      message: 'third',
    });
    await otherUser.post('/members/send-private-message', {
      toUserId: user.id,
      message: 'fourth',
    });

    // message to yourself
    await user.post('/members/send-private-message', {
      toUserId: user.id,
      message: 'fifth',
    });
  });

  it('returns the conversations', async () => {
    const result = await user.get('/inbox/conversations');

    expect(result.length).to.be.equal(3);
    expect(result[0].user).to.be.equal(user.profile.name);
    expect(result[0].username).to.be.equal(user.auth.local.username);
    expect(result[0].text).to.be.not.empty;
  });

  it('returns the user inbox messages as an array of ordered messages (from most to least recent)', async () => {
    const messages = await user.get('/inbox/paged-messages');

    expect(messages.length).to.equal(5);

    // message to yourself
    expect(messages[0].text).to.equal('fifth');
    expect(messages[0].sent).to.equal(false);
    expect(messages[0].uuid).to.equal(user._id);

    expect(messages[1].text).to.equal('fourth');
    expect(messages[2].text).to.equal('third');
    expect(messages[3].text).to.equal('second');
    expect(messages[4].text).to.equal('first');
  });

  it('returns five messages when using page-query ', async () => {
    const promises = [];

    for (let i = 0; i < 10; i += 1) {
      promises.push(user.post('/members/send-private-message', {
        toUserId: user.id,
        message: 'fourth',
      }));
    }

    await Promise.all(promises);

    const messages = await user.get('/inbox/paged-messages?page=1');

    expect(messages.length).to.equal(5);
  });

  it('returns only the messages of one conversation', async () => {
    const messages = await user.get(`/inbox/paged-messages?conversation=${otherUser.id}`);

    expect(messages.length).to.equal(3);
  });

  it('returns the correct message format', async () => {
    const messages = await otherUser.get(`/inbox/paged-messages?conversation=${user.id}`);

    expect(messages[0].toUUID).to.equal(user.id); // from user
    expect(messages[1].toUUID).to.not.exist; // only filled if its from the chat partner
    expect(messages[2].toUUID).to.equal(user.id); // from user
  });
});
