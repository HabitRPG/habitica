import {
  requester,
} from '../../../../helpers/api-integration/v3';

describe('GET /status', () => {
  it('returns status: up', async () => {
    let res = await requester().get('/status');
    expect(res).to.eql({
      status: 'up',
    });
  });
});
