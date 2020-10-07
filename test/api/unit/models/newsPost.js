import { v4 } from 'uuid';
import { model as NewsPost, refreshNewsPost } from '../../../../website/server/models/newsPost';
import { sleep } from '../../../helpers/api-unit.helper';

describe('NewsPost Model', () => {
  it('#lastNewsPost', () => {
    const lastPost = { _id: '1234', publishDate: new Date(), title: 'Title' };
    NewsPost.updateLastNewsPost(lastPost);
    expect(NewsPost.lastNewsPost()).to.equal(lastPost);
  });

  it('#getLastPostFromDatabase', async () => {
    const publishDate = new Date();
    const expectedId = v4();

    await NewsPost.create([
      // more recent but not published
      {
        _id: v4(),
        publishDate: new Date(Number(publishDate) + 50),
        author: v4(),
        published: false,
        title: 'Title',
        credits: 'credits',
        text: 'text',
      },
      // expected
      {
        _id: expectedId,
        publishDate,
        author: v4(),
        published: true,
        title: 'Title',
        credits: 'credits',
        text: 'text',
      },
      // published but less recent
      {
        _id: v4(),
        publishDate: new Date(Number(publishDate) - 50),
        author: v4(),
        published: true,
        title: 'Title',
        credits: 'credits',
        text: 'text',
      },
    ]);

    const fetched = await NewsPost.getLastPostFromDatabase();
    expect(fetched._id).to.equal(expectedId);
  });

  context('#updateLastNewsPost', () => {
    it('updates the post if new one is more recent', () => {
      const previousPost = { _id: '1234', publishDate: new Date(), title: 'Title' };
      NewsPost.updateLastNewsPost(previousPost);
      const newPost = { _id: '1235', publishDate: new Date(Number(previousPost.publishDate) + 1), title: 'Title' };
      NewsPost.updateLastNewsPost(newPost);
      expect(NewsPost.lastNewsPost()._id).to.equal(newPost._id);
    });

    it('does not update the post if new one is from the past', () => {
      const previousPost = { _id: '1234', publishDate: new Date(), title: 'Title' };
      NewsPost.updateLastNewsPost(previousPost);
      const newPost = { _id: '1235', publishDate: new Date(Number(previousPost.publishDate) - 50), title: 'Title' };
      NewsPost.updateLastNewsPost(newPost);
      expect(NewsPost.lastNewsPost()._id).to.equal(previousPost._id);
    });
  });

  it('refreshes the last post at a specific interval', async () => {
    const previousPost = { _id: '1234', publishDate: new Date(), title: 'Title' };
    NewsPost.updateLastNewsPost(previousPost);
    refreshNewsPost(50); // refreshes every 50ms

    const newPost = await NewsPost.create({
      _id: v4(),
      publishDate: new Date(),
      author: v4(),
      published: true,
      title: 'Title',
      credits: 'credits',
      text: 'text',
    });

    expect(NewsPost.lastNewsPost()._id).to.equal(previousPost._id);
    await sleep(0.1); // wait 100ms

    expect(NewsPost.lastNewsPost()._id).to.equal(newPost._id);
  });
});
