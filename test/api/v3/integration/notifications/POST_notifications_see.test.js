import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /notifications/see', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('errors when notification is not found', async () => {
    const dummyId = generateUUID();

    await expect(user.post('/notifications/see', {
      notificationIds: [dummyId],
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotificationNotFound',
      message: t('messageNotificationNotFound'),
    });
  });

  it('mark multiple notifications as seen', async () => {
    expect(user.notifications.length).to.equal(0);

    const id = generateUUID();
    const id2 = generateUUID();
    const id3 = generateUUID();

    await user.update({
      notifications: [{
        id,
        type: 'DROPS_ENABLED',
        data: {},
        seen: false,
      }, {
        id: id2,
        type: 'LOGIN_INCENTIVE',
        data: {},
        seen: false,
      }, {
        id: id3,
        type: 'CRON',
        data: {},
        seen: false,
      }],
    });

    await user.sync();
    expect(user.notifications.length).to.equal(3);

    const res = await user.post('/notifications/see', {
      notificationIds: [id, id3],
    });

    expect(res).to.deep.equal([
      {
        id,
        type: 'DROPS_ENABLED',
        data: {},
        seen: true,
      }, {
        id: id2,
        type: 'LOGIN_INCENTIVE',
        data: {},
        seen: false,
      }, {
        id: id3,
        type: 'CRON',
        data: {},
        seen: true,
      }]);

    await user.sync();
    expect(user.notifications.length).to.equal(3);
    expect(user.notifications[0].id).to.equal(id);
    expect(user.notifications[0].seen).to.equal(true);

    expect(user.notifications[1].id).to.equal(id2);
    expect(user.notifications[1].seen).to.equal(false);

    expect(user.notifications[2].id).to.equal(id3);
    expect(user.notifications[2].seen).to.equal(true);
  });
});
