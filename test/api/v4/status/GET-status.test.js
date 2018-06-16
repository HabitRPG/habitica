import {
  requester,
} from '../../../helpers/api-integration/v4';

describe('GET /status', () => {
  it('returns status: up', async () => {
    let res = await requester().get('/status');
    expect(res).to.eql({
      status: 'v4 is up',
    });
  });
});
