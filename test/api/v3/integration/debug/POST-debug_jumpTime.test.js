import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /debug/jump-time', () => {
  let user;
  let today;
  before(async () => {
    user = await generateUser({ permissions: { fullAccess: true } });
    today = new Date();
  });

  after(async () => {
    nconf.set('TIME_TRAVEL_ENABLED', true);
    await user.post('/debug/jump-time', { disable: true });
    nconf.set('TIME_TRAVEL_ENABLED', false);
  });

  it('Jumps forward', async () => {
    nconf.set('TIME_TRAVEL_ENABLED', true);
    const resultDate = new Date((await user.post('/debug/jump-time', { reset: true })).time);
    expect(resultDate.getDate()).to.eql(today.getDate());
    expect(resultDate.getMonth()).to.eql(today.getMonth());
    expect(resultDate.getFullYear()).to.eql(today.getFullYear());
    const newResultDate = new Date((await user.post('/debug/jump-time', { offsetDays: 1 })).time);
    expect(newResultDate.getDate()).to.eql(today.getDate() + 1);
    expect(newResultDate.getMonth()).to.eql(today.getMonth());
    expect(newResultDate.getFullYear()).to.eql(today.getFullYear());
  });

  it('jumps back', async () => {
    nconf.set('TIME_TRAVEL_ENABLED', true);
    const resultDate = new Date((await user.post('/debug/jump-time', { reset: true })).time);
    expect(resultDate.getDate()).to.eql(today.getDate());
    expect(resultDate.getMonth()).to.eql(today.getMonth());
    expect(resultDate.getFullYear()).to.eql(today.getFullYear());
    const newResultDate = new Date((await user.post('/debug/jump-time', { offsetDays: -1 })).time);
    expect(newResultDate.getDate()).to.eql(today.getDate() - 1);
    expect(newResultDate.getMonth()).to.eql(today.getMonth());
    expect(newResultDate.getFullYear()).to.eql(today.getFullYear());
  });

  it('can jump a lot', async () => {
    nconf.set('TIME_TRAVEL_ENABLED', true);
    const resultDate = new Date((await user.post('/debug/jump-time', { reset: true })).time);
    expect(resultDate.getDate()).to.eql(today.getDate());
    expect(resultDate.getMonth()).to.eql(today.getMonth());
    expect(resultDate.getFullYear()).to.eql(today.getFullYear());
    const newResultDate = new Date((await user.post('/debug/jump-time', { offsetDays: 355 })).time);
    expect(newResultDate.getFullYear()).to.eql(today.getFullYear() + 1);
  });

  it('returns error when the user is not an admin', async () => {
    nconf.set('TIME_TRAVEL_ENABLED', true);
    const regularUser = await generateUser();
    await expect(regularUser.post('/debug/jump-time', { offsetDays: 1 }))
      .eventually.be.rejected.and.to.deep.equal({
        code: 400,
        error: 'BadRequest',
        message: 'You do not have permission to time travel.',
      });
  });

  it('returns error when not in time travel mode', async () => {
    sandbox.stub(nconf, 'get').withArgs('TIME_TRAVEL_ENABLED').returns(false);

    await expect(user.post('/debug/jump-time', { offsetDays: 1 }))
      .eventually.be.rejected.and.to.deep.equal({
        code: 404,
        error: 'NotFound',
        message: 'Not found.',
      });
  });
});
