import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /notifications/:notificationId/read', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('errors when notification is not found', async () => {
    const dummyId = generateUUID();

    await expect(user.post(`/notifications/${dummyId}/read`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotificationNotFound',
      message: t('messageNotificationNotFound'),
    });
  });

  it('removes a notification', async () => {
    expect(user.notifications.length).to.equal(0);

    const id = generateUUID();
    const id2 = generateUUID();

    await user.update({
      notifications: [{
        id,
        type: 'DROPS_ENABLED',
        data: {},
      }, {
        id: id2,
        type: 'LOGIN_INCENTIVE',
        data: {},
      }],
    });

    await user.sync();
    expect(user.notifications.length).to.equal(2);

    const res = await user.post(`/notifications/${id}/read`);
    expect(res).to.deep.equal([{
      id: id2,
      type: 'LOGIN_INCENTIVE',
      data: {},
      seen: false,
    }]);

    await user.sync();
    expect(user.notifications.length).to.equal(1);
    expect(user.notifications[0].id).to.equal(id2);
  });
});
