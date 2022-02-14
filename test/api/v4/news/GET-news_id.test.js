import { v4 } from 'uuid';
import {
  generateUser,
  translate as t,
} from '../../../helpers/api-integration/v4';

describe('GET /news/:newsID', () => {
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

  it('returns an error if the post does not exist', async () => {
    await expect(user.get(`/news/${v4()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('newsPostNotFound'),
    });
  });

  it('fetches an existing post', async () => {
    const existingPost = await user.post('/news', newsPost);
    const fetchedPost = await user.get(`/news/${existingPost._id}`);

    expect(fetchedPost._id).to.equal(existingPost._id);
  });
});
