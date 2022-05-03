import moment from 'moment';
import {
  generateUser,
  sleep,
} from '../../../helpers/api-integration/v4';
import { model as NewsPost } from '../../../../website/server/models/newsPost';

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
      'permissions.news': true,
    });
  });

  it('disallows access to non-admins', async () => {
    const nonAdminUser = await generateUser({ 'permissions.news': false });
    await expect(nonAdminUser.post('/news')).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: 'You don\'t have the required privileges.',
    });
  });

  it('creates news posts', async () => {
    const response = await user.post('/news', newsPost);

    expect(response.title).to.equal(newsPost.title);
    expect(response.credits).to.equal(newsPost.credits);
    expect(response.text).to.equal(newsPost.text);
    expect(response._id).to.exist;

    const res = await user.get('/news');
    expect(res[0]._id).to.equal(response._id);
    expect(res[0].title).to.equal(newsPost.title);
    expect(res[0].text).to.equal(newsPost.text);
  });

  context('calls updateLastNewsPost', () => {
    beforeEach(async () => {
      await NewsPost.remove({ });
    });

    afterEach(async () => {
      newsPost.publishDate = new Date();
      newsPost.published = true;
    });

    it('new post is published and the most recent one', async () => {
      newsPost.publishDate = new Date();
      const newPost = await user.post('/news', newsPost);
      await sleep(0.05);
      expect(NewsPost.lastNewsPost()._id).to.equal(newPost._id);
    });

    it('new post is not published', async () => {
      newsPost.published = false;
      const newPost = await user.post('/news', newsPost);
      await sleep(0.05);
      expect(NewsPost.lastNewsPost()._id).to.not.equal(newPost._id);
    });

    it('new post is published but in the future', async () => {
      newsPost.publishDate = moment().add({ days: 1 }).toDate();
      const newPost = await user.post('/news', newsPost);
      await sleep(0.05);
      expect(NewsPost.lastNewsPost()._id).to.not.equal(newPost._id);
    });

    it('new post is published but not the most recent one', async () => {
      const oldPost = await user.post('/news', newsPost);
      newsPost.publishDate = moment().subtract({ days: 1 }).toDate();
      await user.post('/news', newsPost);
      await sleep(0.05);
      expect(NewsPost.lastNewsPost()._id).to.equal(oldPost._id);
    });
  });

  it('sets default fields', async () => {
    const response = await user.post('/news', {
      title: 'A post',
      credits: 'Credits',
      text: 'Text',
    });

    expect(response.published).to.equal(false);
    expect(response.publishDate).to.exist;
    expect(response.author).to.equal(user._id);
    expect(response.createdAt).to.exist;
    expect(response.updatedAt).to.exist;
  });

  context('required fields', () => {
    it('title', async () => {
      await expect(user.post('/news', {
        text: 'Text',
        credits: 'Credits',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'NewsPost validation failed',
      });
    });

    it('credits', async () => {
      await expect(user.post('/news', {
        text: 'Text',
        title: 'Title',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'NewsPost validation failed',
      });
    });

    it('text', async () => {
      await expect(user.post('/news', {
        credits: 'credits',
        title: 'Title',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'NewsPost validation failed',
      });
    });
  });
});
