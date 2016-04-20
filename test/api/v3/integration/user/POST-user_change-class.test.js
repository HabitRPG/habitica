import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/change-class', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({
      'flags.classSelected': false,
      'stats.lvl': 10,
    });
  });

  // More tests in common code unit tests

  it('changes class', async () => {
    let res = await user.post('/user/change-class?class=rogue');
    await user.sync();

    expect(res).to.eql(JSON.parse(
      JSON.stringify({
        preferences: user.preferences,
        stats: user.stats,
        flags: user.flags,
        items: user.items,
      })
    ));
  });
});
