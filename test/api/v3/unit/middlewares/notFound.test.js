import { requester } from '../../../../helpers/api-integration.helper';

describe('notFound Middleware', () => {
  it('returns a 404 error when the resource is not found', () => {
    let request = requester().get('/api/v3/dummy-url');

    return request.then((errBody) => {
      expect(errBody.error).to.equal('NotFound');
      expect(errBody.message).to.equal('Not found.');
    }).to.eventually.be.rejected.and.eql({
      code: 404,
    });
  });
});
