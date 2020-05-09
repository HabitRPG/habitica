import {
  generateUser,
} from '../../../helpers/api-integration/v4';

describe('DELETE /news/:newsID', () => {
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
      'contributor.newsPoster': true,
    });
  });

  it('disallows access to non-newsPosters', async () => {
    const nonAdminUser = await generateUser({ 'contributor.newsPoster': false });
    await expect(nonAdminUser.post('/news')).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: 'You don\'t have newsPoster access.',
    });
  });

  it('deletes news posts', async () => {
    const existingPost = await user.post('/news', newsPost);
    await user.del(`/news/${existingPost.id}`);

    const returnedPosts = await user.get('/news');
    const deletedPost = returnedPosts.find(returnedPost => returnedPost._id === existingPost._id);

    expect(returnedPosts).is.an('array');
    expect(deletedPost).to.not.exist;
  });
});
