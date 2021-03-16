import {
  requester,
} from '../../../../helpers/api-integration/v3';

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
