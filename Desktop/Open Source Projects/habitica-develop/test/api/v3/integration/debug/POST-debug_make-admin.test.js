import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /debug/make-admin (pended for v3 prod testing)', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  afterEach(() => {
    nconf.set('IS_PROD', false);
  });

  it('makes user an admine', async () => {
    await user.post('/debug/make-admin');

    await user.sync();

    expect(user.contributor.admin).to.eql(true);
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
