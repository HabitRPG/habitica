import {
  generateUser,
} from '../../../helpers/api-integration/v4';

describe('POST /news', () => {
  let user;
  const newsPost = {
    title: 'New Post',
    publishDate: new Date(),
    published: true,
    credits: 'credits',
    text: 'news body',
  };
  beforeEach(async () => {
    user = await generateUser({
      'contributor.admin': true,
    });
  });

  it('disallows access to non-admins', async () => {
    const nonAdminUser = await generateUser({ 'contributor.admin': false });
    await expect(nonAdminUser.post('/news')).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: 'You don\'t have admin access.',
    });
  });

  it('creates news posts', async () => {
    const response = await user.post('/news', newsPost);

    expect(response.title).to.equal(newsPost.title);
    expect(response.credits).to.equal(newsPost.credits);
    expect(response.text).to.equal(newsPost.text);
    expect(response.published).to.equal(newsPost.published);
    expect(response.id).to.exist;

    const res = await user.get('/news');
    expect(res.length).to.be.equal(1);
    expect(res[0].title).to.equal(newsPost.title);
    expect(res[0].text).to.equal(newsPost.text);
  });
});
