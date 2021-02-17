import common from '../../../../../website/common';
import {
  getGemsBlock,
  validateGiftMessage,
} from '../../../../../website/server/libs/payments/gems';
import { model as User } from '../../../../../website/server/models/user';

const { i18n } = common;

describe('payments/gems', () => {
  describe('#getGemsBlock', () => {
    it('throws an error if the gem block key is invalid', () => {
      expect(() => getGemsBlock('invalid')).to.throw;
    });

    it('returns the gem block for the given key', () => {
      expect(getGemsBlock('21gems')).to.equal(common.content.gems['21gems']);
    });
  });

  describe('#validateGiftMessage', () => {
    let user;
    let gift;

    beforeEach(() => {
      user = new User();

      gift = {
        message: (` // exactly 201 chars
A gift message that is over the 200 chars limit.
A gift message that is over the 200 chars limit.
A gift message that is over the 200 chars limit.
A gift message that is over the 200 chars limit. 1
        `).trim().substring(0, 201),
      };

      expect(gift.message.length).to.equal(201);
    });

    it('throws if the gift message is too long', () => {
      let expectedErr;

      try {
        validateGiftMessage(gift, user);
      } catch (err) {
        expectedErr = err;
      }

      expect(expectedErr).to.exist;
      expect(expectedErr).to.eql({
        httpCode: 400,
        name: 'BadRequest',
        message: i18n.t('giftMessageTooLong', { maxGiftMessageLength: 200 }),
      });
    });

    it('does not throw if the gift message is not too long', () => {
      gift.message = gift.message.substring(0, 200);
      expect(() => validateGiftMessage(gift, user)).to.not.throw;
    });

    it('does not throw if it is not a gift', () => {
      expect(() => validateGiftMessage(null, user)).to.not.throw;
    });
  });
});
