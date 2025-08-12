import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /debug/jump-time', () => {
  let user;
  let today;
  let nconfStub;

  before(async () => {
    user = await generateUser({ permissions: { fullAccess: true } });
    today = new Date();
  });

  beforeEach(() => {
    nconfStub = sandbox.stub(nconf, 'get');
    nconfStub.withArgs('TIME_TRAVEL_ENABLED').returns(true);
  });

  afterEach(() => {
    nconfStub.restore();
  });

  after(async () => {
    nconf.set('TIME_TRAVEL_ENABLED', true);
    await user.post('/debug/jump-time', { disable: true });
    nconf.set('TIME_TRAVEL_ENABLED', false);
  });

  it('Jumps forward', async () => {
    const resultDate = new Date((await user.post('/debug/jump-time', { reset: true })).time);
    expect(resultDate.getDate()).to.eql(today.getDate());
    expect(resultDate.getMonth()).to.eql(today.getMonth());
    expect(resultDate.getFullYear()).to.eql(today.getFullYear());
    const newResultDate = new Date((await user.post('/debug/jump-time', { offsetDays: 1 })).time);
    const tomorrow = new Date(today.valueOf());
    tomorrow.setDate(today.getDate() + 1);
    expect(newResultDate.getDate()).to.eql(tomorrow.getDate());
    expect(newResultDate.getMonth()).to.eql(tomorrow.getMonth());
    expect(newResultDate.getFullYear()).to.eql(tomorrow.getFullYear());
  });

  it('jumps back', async () => {
    const resultDate = new Date((await user.post('/debug/jump-time', { reset: true })).time);
    expect(resultDate.getDate()).to.eql(today.getDate());
    expect(resultDate.getMonth()).to.eql(today.getMonth());
    expect(resultDate.getFullYear()).to.eql(today.getFullYear());
    const newResultDate = new Date((await user.post('/debug/jump-time', { offsetDays: -1 })).time);
    const yesterday = new Date(today.valueOf());
    yesterday.setDate(today.getDate() - 1);
    expect(newResultDate.getDate()).to.eql(yesterday.getDate());
    expect(newResultDate.getMonth()).to.eql(yesterday.getMonth());
    expect(newResultDate.getFullYear()).to.eql(yesterday.getFullYear());
  });

  it('can jump a lot', async () => {
    const resultDate = new Date((await user.post('/debug/jump-time', { reset: true })).time);
    expect(resultDate.getDate()).to.eql(today.getDate());
    expect(resultDate.getMonth()).to.eql(today.getMonth());
    expect(resultDate.getFullYear()).to.eql(today.getFullYear());
    const newResultDate = new Date((await user.post('/debug/jump-time', { offsetDays: 365 })).time);
    expect(newResultDate.getFullYear()).to.eql(today.getFullYear() + 1);
  });

  it('returns error when the user is not an admin', async () => {
    const regularUser = await generateUser();
    await expect(regularUser.post('/debug/jump-time', { offsetDays: 1 }))
      .eventually.be.rejected.and.to.deep.equal({
        code: 400,
        error: 'BadRequest',
        message: 'You do not have permission to time travel.',
      });
  });

  it('returns error when not in time travel mode', async () => {
    nconfStub.withArgs('TIME_TRAVEL_ENABLED').returns(false);

    await expect(user.post('/debug/jump-time', { offsetDays: 1 }))
      .eventually.be.rejected.and.to.deep.equal({
        code: 404,
        error: 'NotFound',
        message: 'Not found.',
      });
  });
});
