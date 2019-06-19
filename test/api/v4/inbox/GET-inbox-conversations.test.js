import {
  generateUser,
} from '../../../helpers/api-integration/v4';

describe('GET /inbox/conversations', () => {
  let user;
  let otherUser;
  let thirdUser;

  before(async () => {
    [user, otherUser, thirdUser] = await Promise.all([generateUser(), generateUser(), generateUser()]);

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
  });
});
