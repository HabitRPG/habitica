import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /debug/update-user', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  after(() => {
    nconf.set('IS_PROD', false);
  });

  it('sets protected values', async () => {
    let newCron = new Date(2015, 11, 20);

    await user.post('/debug/update-user', {
      balance: 100,
      lastCron: newCron,
    });

    await user.sync()

    expect(user.lastCron).to.eql(newCron);
    expect(user.balance).to.eql(100);
  });

  it('sets nested values', async () => {
    await user.post('/debug/update-user', {
      'contributor.level': 9,
      'purchased.txnCount': 100,
    });

    await user.sync()

    expect(user.contributor.level).to.eql(9);
    expect(user.purchased.txnCount).to.eql(100);
  });

  it('returns error when not in production mode', async () => {
    nconf.set('IS_PROD', true);

    await expect(user.post('/debug/update-user'))
    .eventually.be.rejected.and.to.deep.equal({
      code: 404,
      error: 'NotFound',
      message: 'Not found.',
    });
  });
});
