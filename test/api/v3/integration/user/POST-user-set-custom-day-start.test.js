import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

let user;
let endpoint = '/user/set-custom-day-start';

describe('POST /user/set-custom-day-start', () => {
  beforeEach(async () => {
    user = await generateUser();
  });

  it('update user.preferences.dayStart', async () => {
    expect(user.preferences.dayStart).to.eql(0);
    await user.post(endpoint, { dayStart: 1 });
    await user.sync();
    expect(user.preferences.dayStart).to.eql(1);
  });
});
