import {
  generateUser,
} from '../../../helpers/api-integration/v4';
import { model as NewsPost } from '../../../../website/server/models/newsPost';

describe('POST /news/tell-me-later', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
    NewsPost.updateLastNewsPost({ id: '1234', publishDate: new Date(), title: 'Title' });
  });

  it('marks new stuff as read and adds notification', async () => {
    const initialNotifications = user.notifications.length;

    await user.post('/news/tell-me-later');
    await user.sync();

    expect(user.flags.lastNewStuffRead).to.equal('1234');
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
