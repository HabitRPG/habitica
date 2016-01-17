import { requester } from '../../../helpers/api-integration/v3';

describe('notFound Middleware', () => {
  it('returns a 404 error when the resource is not found', async () => {
    let request = requester().get('/api/v3/dummy-url');

    await expect(request).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: 'Not found.',
    });
  });
});
