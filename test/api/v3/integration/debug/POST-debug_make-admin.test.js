import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /debug/make-admin', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  afterEach(() => {
    nconf.set('IS_PROD', false);
  });

  it('makes user an admin', async () => {
    await user.post('/debug/make-admin');

    await user.sync();

    expect(user.permissions.fullAccess).to.eql(true);
  });

  it('returns error when not in production mode', async () => {
    nconf.set('IS_PROD', true);

    await expect(user.post('/debug/make-admin'))
      .eventually.be.rejected.and.to.deep.equal({
        code: 404,
        error: 'NotFound',
        message: 'Not found.',
      });
  });
});
