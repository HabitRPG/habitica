import {
  canBuySkuItem,
} from '../../../../../website/server/libs/payments/skuItem';
import { model as User } from '../../../../../website/server/models/user';

describe('payments/skuItems', () => {
  let user;
  let clock;

  beforeEach(() => {
    user = new User();
    clock = null;
  });
  afterEach(() => {
    if (clock !== null) clock.restore();
  });

  describe('#canBuySkuItem', () => {
    it('returns true for random sku', () => {
      expect(canBuySkuItem('something', user)).to.be.true;
    });

    describe('#gryphatrice', () => {
      const sku = 'Pet-Gryphatrice-Jubilant';
      it('returns true during birthday week', () => {
        clock = sinon.useFakeTimers(new Date('2023-01-31'));
        expect(canBuySkuItem(sku, user)).to.be.true;
      });
      it('returns false outside of birthday week', () => {
        clock = sinon.useFakeTimers(new Date('2023-01-20'));
        expect(canBuySkuItem(sku, user)).to.be.false;
      });
      it('returns false if user already owns it', () => {
        clock = sinon.useFakeTimers(new Date('2023-02-01'));
        user.items.pets['Gryphatrice-Jubilant'] = 5;
        expect(canBuySkuItem(sku, user)).to.be.false;
      });
    });
  });
});
