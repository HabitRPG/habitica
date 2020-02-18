import {
  generateUser,
} from '../../../helpers/api-integration/v4';
import { model as NewsPost } from '../../../../website/server/models/newsPost';

describe('POST /news', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('marks new stuff as read', async () => {
    NewsPost.updateLastNewsPostID('1234', new Date());
    await user.post('/news/read');
    await user.sync();

    expect(user.flags.lastNewStuffRead).to.equal('1234');
  });
});
