import {
  requester,
} from '../../../../helpers/api-v3-integration.helper';

describe('GET /status', () => {
  it('returns status: up', async () => {
    let res = await requester().get('/status');
    expect(res).to.eql({
      status: 'up',
    });
  });
});
