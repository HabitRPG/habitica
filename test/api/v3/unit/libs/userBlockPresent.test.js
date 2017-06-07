import blockUser from '../../../../../website/common/script/ops/blockUser';
import userBlockPresent from '../../../../../website/server/libs/userBlockPresent';

import {
  generateUser,
} from '../../../../helpers/common.helper';

describe('userBlockPresent', () => {
  let user1, user2;

  beforeEach(() => {
    user1 = generateUser();
    user2 = generateUser();
  });

  context('when a user has blocked another user', () => {
    it('detects if the first user has blocked the second', () => {
      blockUser(user1, { params: { uuid: user2._id } });
      expect(userBlockPresent(user1, user2)).to.eq(true);
    });

    it('detects if the second user has blocked the first', () => {
      blockUser(user2, { params: { uuid: user1._id } });
      expect(userBlockPresent(user1, user2)).to.eq(true);
    });
  });

  context('when no user block exists', () => {
    it('does not detect a block', () => {
      expect(userBlockPresent(user1, user2)).to.eq(false);
    });
  });
});
