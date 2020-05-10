import {
  requester,
} from '../../../../helpers/api-integration/v3';
import {
  generateUser,
} from '../../../../helpers/api-integration/v4';

describe('GET /news', () => {
  let api;
  const newsPost = {
    title: 'New Post',
    publishDate: new Date(),
    published: true,
    credits: 'credits',
    text: 'news body',
  };
  beforeEach(async () => {
    api = requester();
  });

  it('returns the latest news in html format, does not require authentication', async () => {
    const user = await generateUser({
      'contributor.admin': true,
    });
    await user.post('/news', newsPost);
    const res = await api.get('/news');
    expect(res).to.be.a.string;
  });

  it('returns empty post when no available', async () => {
    const res = await api.get('/news');
    expect(res).to.be.a.string;
  });
});
