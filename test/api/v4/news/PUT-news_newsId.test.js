import { v4 } from 'uuid';
import {
  generateUser,
  translate as t,
} from '../../../helpers/api-integration/v4';

describe('PUT /news/:newsID', () => {
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

  it('disallows access to non-admins', async () => {
    const nonAdminUser = await generateUser({ 'contributor.newsPoster': false });
    await expect(nonAdminUser.put('/news/1234')).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: 'You don\'t have news poster access.',
    });
  });

  it('returns an error if the post does not exist', async () => {
    await expect(user.put(`/news/${v4()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('newsPostNotFound'),
    });
  });

  it('updates existing news posts', async () => {
    const existingPost = await user.post('/news', newsPost);
    const updatedPost = await user.put(`/news/${existingPost._id}`, {
      title: 'Changed Title',
    });

    expect(updatedPost.title).to.equal('Changed Title');
    expect(updatedPost.credits).to.equal(existingPost.credits);
    expect(updatedPost.text).to.equal(existingPost.text);
    expect(updatedPost.published).to.equal(existingPost.published);
    expect(updatedPost._id).to.equal(existingPost._id);
  });
});
