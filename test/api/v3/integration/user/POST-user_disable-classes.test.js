import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/disable-classes', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  // More tests in common code unit tests

  it('disable classes', async () => {
    let res = await user.post('/user/disable-classes');
    await user.sync();

    expect(res).to.eql(JSON.parse(
      JSON.stringify({
        preferences: user.preferences,
        stats: user.stats,
        flags: user.flags,
      })
    ));
  });
});
