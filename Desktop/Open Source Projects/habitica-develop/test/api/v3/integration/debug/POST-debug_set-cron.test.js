import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /debug/set-cron', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  afterEach(() => {
    nconf.set('IS_PROD', false);
  });

  it('sets last cron', async () => {
    let newCron = new Date(2015, 11, 20);

    await user.post('/debug/set-cron', {
      lastCron: newCron,
    });

    await user.sync();

    expect(user.lastCron).to.eql(newCron);
  });

  it('returns error when not in production mode', async () => {
    nconf.set('IS_PROD', true);

    await expect(user.post('/debug/set-cron'))
    .eventually.be.rejected.and.to.deep.equal({
      code: 404,
      error: 'NotFound',
      message: 'Not found.',
    });
  });
});
