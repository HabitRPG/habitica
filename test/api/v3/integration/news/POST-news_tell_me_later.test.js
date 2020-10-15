import {
  generateUser,
} from '../../../../helpers/api-integration/v3';
import { model as NewsPost } from '../../../../../website/server/models/newsPost';

describe('POST /news/tell-me-later', () => {
  let user;

  beforeEach(async () => {
    NewsPost.updateLastNewsPost({
      _id: '1234', publishDate: new Date(), title: 'Title', published: true,
    });
    user = await generateUser();
  });

  it('marks new stuff as read and adds notification', async () => {
    const initialNotifications = user.notifications.length;

    await user.post('/news/tell-me-later');
    await user.sync();

    expect(user.flags.lastNewStuffRead).to.equal('1234');
    // fetching the user because newStuff is a computed property
    expect((await user.get('/user')).flags.newStuff).to.equal(false);
    expect(user.notifications.length).to.equal(initialNotifications + 1);

    const notification = user.notifications[user.notifications.length - 1];

    expect(notification.type).to.equal('NEW_STUFF');
    // should be marked as seen by default so it's not counted in the number of notifications
    expect(notification.seen).to.equal(true);
    expect(notification.data.title).to.be.a.string;
  });

  it('never adds two notifications', async () => {
    const initialNotifications = user.notifications.length;

    await user.post('/news/tell-me-later');
    await user.post('/news/tell-me-later');

    await user.sync();

    expect(user.notifications.length).to.equal(initialNotifications + 1);
  });
});
