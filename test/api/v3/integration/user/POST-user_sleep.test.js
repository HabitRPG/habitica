import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/sleep', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  // More tests in common code unit tests

  it('toggles sleep status', async () => {
    const res = await user.post('/user/sleep');
    expect(res).to.eql(true);
    await user.sync();
    expect(user.preferences.sleep).to.be.true;

    const res2 = await user.post('/user/sleep');
    expect(res2).to.eql(false);
    await user.sync();
    expect(user.preferences.sleep).to.be.false;
  });
});
