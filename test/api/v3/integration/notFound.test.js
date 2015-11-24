import { requester } from '../../../helpers/api-integration.helper';

describe('notFound Middleware', () => {
  it('returns a 404 error when the resource is not found', () => {
    let request = requester().get('/api/v3/dummy-url');

    return expect(request).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: 'Not found.',
    });
  });
});
