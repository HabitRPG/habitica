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
  beforeEach(async () => {
    api = requester();
    const user = await generateUser({
      'contributor.newsPoster': true,
    });
    await user.post('/news', newsPost);
    await user.post('/news', newsPost);
    await user.post('/news', newsPost);
  });

  it('returns the latest news in json format, does not require authentication', async () => {
    const res = await api.get('/news');
    expect(res.length).to.be.equal(3);
    expect(res[0].title).to.be.not.empty;
    expect(res[0].text).to.be.not.empty;
  });
});
