import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/mark-pms-read', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  // More tests in common code unit tests

  it('marks user\'s private messages as read', async () => {
    await user.update({
      'inbox.newMessages': 1,
    });
    await user.post('/user/mark-pms-read');
    await user.sync();
    expect(user.inbox.newMessages).to.equal(0);
  });
});
