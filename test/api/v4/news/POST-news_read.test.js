import {
  generateUser,
} from '../../../helpers/api-integration/v4';
import { model as NewsPost } from '../../../../website/server/models/newsPost';

describe('POST /news/read', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('marks new stuff as read', async () => {
    NewsPost.updateLastNewsPost({ _id: '1234', publishDate: new Date(), published: true });
    await user.post('/news/read');
    await user.sync();

    expect(user.flags.lastNewStuffRead).to.equal('1234');
    // fetching the user because newStuff is a computed property
    expect((await user.get('/user')).flags.newStuff).to.equal(false);
  });
});
