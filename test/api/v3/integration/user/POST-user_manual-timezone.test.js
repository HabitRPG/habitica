import { generateUser } from '../../../../helpers/api-integration/v3';

let user;
let endpoint = '/user/manual-timezone';

describe('POST /user/manual-timezone', () => {
  beforeEach(async () => {
    user = await generateUser();
  });

  it('updates user.preferences.manualTimezoneId', async () => {
    expect(user.preferences.manualTimezoneId).to.eql(-1);

    await user.post(endpoint, { id: 1 });
    await user.sync();

    expect(user.preferences.manualTimezoneId).to.eql(1);
  });

  it('errors if invalid value is passed', async () => {
    await expect(user.post(endpoint, { id: 'foo' }))
      .to.eventually.be.rejected;

    await expect(user.post(endpoint, { id: -42 }))
      .to.eventually.be.rejected;
  });
});
