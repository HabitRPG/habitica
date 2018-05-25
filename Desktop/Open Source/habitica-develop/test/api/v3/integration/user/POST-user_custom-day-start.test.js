import moment from 'moment';
import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

let user;
let endpoint = '/user/custom-day-start';

describe('POST /user/custom-day-start', () => {
  beforeEach(async () => {
    user = await generateUser();
  });

  it('updates user.preferences.dayStart', async () => {
    expect(user.preferences.dayStart).to.eql(0);

    await user.post(endpoint, { dayStart: 1 });
    await user.sync();

    expect(user.preferences.dayStart).to.eql(1);
  });

  it('sets lastCron to the current time to prevent an unexpected cron', async () => {
    let oldCron = moment().subtract(7, 'hours');

    await user.update({lastCron: oldCron});
    await user.post(endpoint, { dayStart: 1 });
    await user.sync();

    expect(user.lastCron.valueOf()).to.be.gt(oldCron.valueOf());
  });

  it('returns a confirmation message', async () => {
    let {message} = await user.post(endpoint, { dayStart: 1 });

    expect(message).to.eql(t('customDayStartHasChanged'));
  });

  it('errors if invalid value is passed', async () => {
    await expect(user.post(endpoint, { dayStart: 'foo' }))
      .to.eventually.be.rejected;

    await expect(user.post(endpoint, { dayStart: 24}))
      .to.eventually.be.rejected;
  });
});
