import { v4 } from 'uuid';
import {
  generateUser,
  translate as t,
  sleep,
} from '../../../helpers/api-integration/v4';
import { model as NewsPost } from '../../../../website/server/models/newsPost';

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
      'permissions.news': true,
    });
  });

  it('disallows access to non-admins', async () => {
    const nonAdminUser = await generateUser({ 'permissions.news': false });
    await expect(nonAdminUser.put('/news/1234')).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: 'You don\'t have the required privileges.',
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

  context('calls updateLastNewsPost', () => {
    beforeEach(async () => {
      await NewsPost.remove({ });
    });

    it('updates post data', async () => {
      const existingPost = await user.post('/news', { ...newsPost, publishDate: new Date() });
      const updatedPost = await user.put(`/news/${existingPost._id}`, {
        title: 'Changed Title',
      });
      await sleep(0.05);

      expect(NewsPost.lastNewsPost().title).to.equal(updatedPost.title);
    });

    it('updated post is not published', async () => {
      const oldPost = await user.post('/news', { ...newsPost, publishDate: new Date() });
      const newUnpublished = await user.post('/news', { ...newsPost, published: false });
      await user.put(`/news/${newUnpublished._id}`, {
        title: 'Changed Title',
      });
      await sleep(0.05);

      expect(NewsPost.lastNewsPost()._id).to.equal(oldPost._id);
    });

    it('updated post is published', async () => {
      await user.post('/news', { ...newsPost, publishDate: new Date() });
      const newUnpublished = await user.post('/news', { ...newsPost, published: false, publishDate: new Date() });
      await user.put(`/news/${newUnpublished._id}`, {
        publishDate: new Date(),
        published: true,
      });
      await sleep(0.05);

      expect(NewsPost.lastNewsPost()._id).to.equal(newUnpublished._id);
    });

    it('updated post publishDate is in future', async () => {
      const oldPost = await user.post('/news', { ...newsPost, publishDate: new Date() });
      const newUnpublished = await user.post('/news', newsPost);
      await user.put(`/news/${newUnpublished._id}`, {
        publishDate: Date.now() + 50000,
      });
      await sleep(0.05);

      expect(NewsPost.lastNewsPost()._id).to.equal(oldPost._id);
    });
  });
});
