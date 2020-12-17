import {
  generateUser,
} from '../../../../helpers/api-integration/v4';

describe('GET /user/mark-pms-read', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  // More tests in common code unit tests

  it('marks user\'s private messages as read', async () => {
    await user.update({
      'inbox.newMessages': 1,
    });
    const unreadMessageCount = 1
    await user.get(`/user/mark-pms-read?count=${unreadMessageCount}&to=${user._id}`);
    await user.sync();
    expect(user.inbox.newMessages).to.equal(1);
  });
});
