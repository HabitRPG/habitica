import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';
import common from '../../../../../website/common';

describe('POST /notifications/:notificationId/read', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('errors when notification is not found', async () => {
    let dummyId = generateUUID();
    await expect(user.post(`/notifications/${dummyId}/read`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageNotificationNotFound'),
      });
  });

  xit('removes a notification', async () => {
  });
});
