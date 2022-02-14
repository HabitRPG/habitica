import { v4 } from 'uuid';
import {
  generateUser,
  translate as t,
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
      'permissions.news': true,
    });
  });

  it('disallows access to non-newsPosters', async () => {
    const nonAdminUser = await generateUser({ 'permissions.news': false });
    await expect(nonAdminUser.del(`/news/${v4()}`)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('noPrivAccess'),
    });
  });

  it('returns an error if the post does not exist', async () => {
    await expect(user.del(`/news/${v4()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('newsPostNotFound'),
    });
  });

  it('deletes news posts', async () => {
    const existingPost = await user.post('/news', newsPost);
    await user.del(`/news/${existingPost._id}`);

    const returnedPosts = await user.get('/news');
    const deletedPost = returnedPosts.find(returnedPost => returnedPost._id === existingPost._id);

    expect(returnedPosts).is.an('array');
    expect(deletedPost).to.not.exist;
  });
});
