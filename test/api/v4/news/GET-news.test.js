import {
  requester, generateUser,
} from '../../../helpers/api-integration/v4';

describe('GET /news', () => {
  let api;
  const newsPost = {
    title: 'New Post',
    publishDate: new Date(),
    published: true,
    credits: 'credits',
    text: 'news body',
  };

  before(async () => {
    api = requester();
    const user = await generateUser({
      'permissions.news': true,
    });

    await Promise.all([
      user.post('/news', newsPost),
      user.post('/news', newsPost),
      user.post('/news', newsPost),
      user.post('/news', newsPost),
      user.post('/news', newsPost),
      user.post('/news', newsPost),
      user.post('/news', newsPost),
      user.post('/news', newsPost),
      user.post('/news', newsPost),
      user.post('/news', newsPost),
      user.post('/news', newsPost),
      user.post('/news', newsPost),
    ]);
  });

  it('returns the latest news in json format, does not require authentication, 10 per page', async () => {
    const res = await api.get('/news');
    expect(res.length).to.be.equal(10);
    expect(res[0].title).to.be.not.empty;
    expect(res[0].text).to.be.not.empty;
  });

  it('supports pagination', async () => {
    const res = await api.get('/news?page=1');
    expect(res.length).to.be.equal(2);
    expect(res[0].title).to.be.not.empty;
    expect(res[0].text).to.be.not.empty;
  });
});
