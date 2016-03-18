import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /debug/add-hourglass', () => {
  let userToGetHourGlass;

  before(async () => {
    userToGetHourGlass = await generateUser();
  });

  after(() => {
    nconf.set('IS_PROD', false);
  });

  it('adds Hourglass to the current user', async () => {
    await userToGetHourGlass.post('/debug/add-hourglass');

    let userWithHourGlass = await userToGetHourGlass.get('/user');

    expect(userWithHourGlass.purchased.plan.consecutive.trinkets).to.equal(1);
  });

  it('returns error when not in production mode', async () => {
    nconf.set('IS_PROD', true);

    await expect(userToGetHourGlass.post('/debug/add-hourglass'))
      .eventually.be.rejected.and.to.deep.equal({
        code: 404,
        error: 'NotFound',
        message: 'Not found.',
      });
  });
});
