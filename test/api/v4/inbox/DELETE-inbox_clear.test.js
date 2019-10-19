import {
  generateUser,
} from '../../../helpers/api-integration/v4';

describe('DELETE /inbox/clear', () => {
  it('removes all inbox messages for the user', async () => {
    const [user, otherUser] = await Promise.all([generateUser(), generateUser()]);

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

    let messages = await user.get('/inbox/messages');
    expect(messages.length).to.equal(3);

    await user.del('/inbox/clear/');

    messages = await user.get('/inbox/messages');
    expect(messages.length).to.equal(0);
  });
});
