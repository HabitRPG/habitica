import {
  generateUser,
} from '../../../../../helpers/api-integration/v3';

describe('POST /user/allocate-now', () => {
  // More tests in common code unit tests

  it('auto allocates all points', async () => {
    let user = await generateUser({
      'stats.points': 5,
      'stats.int': 3,
      'stats.con': 9,
      'stats.per': 9,
      'stats.str': 9,
      'preferences.allocationMode': 'flat',
    });

    let res = await user.post('/user/allocate-now');
    await user.sync();

    expect(res).to.eql(user.stats);
    expect(user.stats.points).to.equal(0);
    expect(user.stats.con).to.equal(9);
    expect(user.stats.int).to.equal(8);
    expect(user.stats.per).to.equal(9);
    expect(user.stats.str).to.equal(9);
  });
});
