import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /notifications/:notificationId/read', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('errors when notification is not found', async () => {
    let dummyId = generateUUID();

    await expect(user.post('/notifications/read', {
      notificationIds: [dummyId],
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('messageNotificationNotFound'),
    });
  });

  it('removes multiple notifications', async () => {
    expect(user.notifications.length).to.equal(0);

    const id = generateUUID();
    const id2 = generateUUID();
    const id3 = generateUUID();

    await user.update({
      notifications: [{
        id,
        type: 'DROPS_ENABLED',
        data: {},
      }, {
        id: id2,
        type: 'LOGIN_INCENTIVE',
        data: {},
      }, {
        id: id3,
        type: 'CRON',
        data: {},
      }],
    });

    await user.sync();
    expect(user.notifications.length).to.equal(3);

    const res = await user.post('/notifications/read', {
      notificationIds: [id, id3],
    });

    expect(res).to.deep.equal([{
      id: id2,
      type: 'LOGIN_INCENTIVE',
      data: {},
    }]);

    await user.sync();
    expect(user.notifications.length).to.equal(1);
    expect(user.notifications[0].id).to.equal(id2);
  });
});
