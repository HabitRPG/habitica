import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /notifications/:notificationId/see', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('errors when notification is not found', async () => {
    const dummyId = generateUUID();

    await expect(user.post(`/notifications/${dummyId}/see`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotificationNotFound',
      message: t('messageNotificationNotFound'),
    });
  });

  it('mark a notification as seen', async () => {
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

    const userObj = await user.get('/user'); // so we can check that defaults have been applied
    expect(userObj.notifications.length).to.equal(2);
    expect(userObj.notifications[0].seen).to.equal(false);

    const res = await user.post(`/notifications/${id}/see`);
    expect(res).to.deep.equal({
      id,
      type: 'DROPS_ENABLED',
      data: {},
      seen: true,
    });

    await user.sync();
    expect(user.notifications.length).to.equal(2);
    expect(user.notifications[0].id).to.equal(id);
    expect(user.notifications[0].seen).to.equal(true);
  });
});
