import { v4 } from 'uuid';
import { model as NewsPost, reloadLastNewsPostNow } from '../../../../website/server/models/newsPost';

describe('NewsPost Model', () => {
  const publishDate = Number(new Date());

  // NOTE publishDate is manually increased by +500 for each test
  // to make sure it's always in the future from the previous one
  // bevause NewsPost.lastNewsPost() is not reset between tests.
  // And without a more recent publishDate it wouldn't update

  it('#lastNewsPost', () => {
    const lastPost = { _id: v4(), publishDate, published: true };
    NewsPost.updateLastNewsPost(lastPost);
    expect(NewsPost.lastNewsPost()).to.equal(lastPost);
  });

  it('#getLastPostFromDatabase', async () => {
    const expectedId = v4();

    await NewsPost.create([
      // more recent but not published
      {
        _id: v4(),
        publishDate: new Date(publishDate + 50),
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
    it('updates the post if new one is more recent and published', () => {
      const previousPost = {
        _id: v4(),
        publishDate: new Date(publishDate + 100),
        published: true,
      };
      NewsPost.updateLastNewsPost(previousPost);
      const newPost = {
        _id: v4(),
        publishDate: new Date(publishDate + 150),
        published: true,
      };
      NewsPost.updateLastNewsPost(newPost);
      expect(NewsPost.lastNewsPost()._id).to.equal(newPost._id);
    });

    it('does not update the post if new one is from the past', () => {
      const previousPost = new NewsPost({
        _id: v4(), publishDate: new Date(publishDate + 200), published: true,
      });
      NewsPost.updateLastNewsPost(previousPost);
      const newPost = new NewsPost({
        _id: v4(), publishDate: new Date(publishDate + 175), published: true,
      });
      NewsPost.updateLastNewsPost(newPost);
      expect(NewsPost.lastNewsPost()._id).to.equal(previousPost._id);
    });

    it('does not update the post if new one is not published', () => {
      const previousPost = new NewsPost({
        _id: v4(), publishDate: new Date(publishDate + 250), published: true,
      });
      NewsPost.updateLastNewsPost(previousPost);
      const newPost = new NewsPost({
        _id: v4(), publishDate: new Date(publishDate + 300), published: false,
      });
      NewsPost.updateLastNewsPost(newPost);
      expect(NewsPost.lastNewsPost()._id).to.equal(previousPost._id);
    });
  });

  context('reloads the last post', () => {
    function createPost (fields) {
      return NewsPost.create({
        _id: v4(),
        publishDate: new Date(),
        author: v4(),
        published: true,
        title: 'Title',
        credits: 'credits',
        text: 'text',
        ...fields,
      });
    }

    beforeEach(async () => {
      await NewsPost.deleteMany();
    });

    it('picks up a new post', async () => {
      const newPost = await createPost();
      await reloadLastNewsPostNow();
      expect(NewsPost.lastNewsPost()._id).to.equal(newPost._id);
    });

    it('falls back to the previous post when the latest one is deleted', async () => {
      const previousPost = await createPost({ publishDate: new Date(Date.now() - 1000) });
      const latestPost = await createPost();
      await reloadLastNewsPostNow();
      expect(NewsPost.lastNewsPost()._id).to.equal(latestPost._id);

      await NewsPost.deleteOne({ _id: latestPost._id });
      await reloadLastNewsPostNow();
      expect(NewsPost.lastNewsPost()._id).to.equal(previousPost._id);
    });

    it('clears the post when none is published', async () => {
      await createPost({ published: false });
      await reloadLastNewsPostNow();
      expect(NewsPost.lastNewsPost()).to.be.null;
    });
  });
});
