import {
  requester,
} from '../../../../helpers/api-v3-integration.helper';

describe('GET /news', () => {
  let api;

  beforeEach(async () => {
    api = requester();
  });

  it('returns the latest news in html format, does not require authentication', async () => {
    const res = await api.get('/news');
    expect(res).to.be.a.string;
  });
});
