import shared from '../../../website/common';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shops', () => {
  let user = generateUser();

  describe('market', () => {
    let shopCategories = shared.shops.getMarketCategories(user);

    it('contains at least the 3 default categories', () => {
      expect(shopCategories.length).to.be.greaterThan(2);
    });

    it('does not duplicate identifiers', () => {
      let identifiers = Array.from(new Set(shopCategories.map(cat => cat.identifier)));

      expect(identifiers.length).to.eql(shopCategories.length);
    });

    it('items contain required fields', () => {
      _.each(shopCategories, (category) => {
        _.each(category.items, (item) => {
          expect(item).to.have.all.keys(['key', 'text', 'notes', 'value', 'currency', 'locked', 'purchaseType', 'class']);
        });
      });
    });
  });

  describe('questShop', () => {
    let shopCategories = shared.shops.getQuestShopCategories(user);

    it('does not contain an empty category', () => {
      _.each(shopCategories, (category) => {
        expect(category.items.length).to.be.greaterThan(0);
      });
    });

    it('does not duplicate identifiers', () => {
      let identifiers = Array.from(new Set(shopCategories.map(cat => cat.identifier)));

      expect(identifiers.length).to.eql(shopCategories.length);
    });

    it('items contain required fields', () => {
      _.each(shopCategories, (category) => {
        _.each(category.items, (item) => {
          expect(item).to.have.all.keys('key', 'text', 'notes', 'value', 'currency', 'locked', 'purchaseType', 'boss', 'class', 'collect', 'drop', 'unlockCondition', 'lvl');
        });
      });
    });
  });

  describe('timeTravelers', () => {
    let shopCategories = shared.shops.getTimeTravelersCategories(user);

    it('does not contain an empty category', () => {
      _.each(shopCategories, (category) => {
        expect(category.items.length).to.be.greaterThan(0);
      });
    });

    it('does not duplicate identifiers', () => {
      let identifiers = Array.from(new Set(shopCategories.map(cat => cat.identifier)));

      expect(identifiers.length).to.eql(shopCategories.length);
    });

    it('items contain required fields', () => {
      _.each(shopCategories, (category) => {
        _.each(category.items, (item) => {
          expect(item).to.have.all.keys('key', 'text', 'value', 'currency', 'locked', 'purchaseType', 'class', 'notes', 'class');
        });
      });
    });
  });

  describe('seasonalShop', () => {
    let shopCategories = shared.shops.getSeasonalShopCategories(user);

    it('does not contain an empty category', () => {
      _.each(shopCategories, (category) => {
        expect(category.items.length).to.be.greaterThan(0);
      });
    });

    it('does not duplicate identifiers', () => {
      let identifiers = Array.from(new Set(shopCategories.map(cat => cat.identifier)));

      expect(identifiers.length).to.eql(shopCategories.length);
    });

    it('items contain required fields', () => {
      _.each(shopCategories, (category) => {
        _.each(category.items, (item) => {
          expect(item).to.have.all.keys('key', 'text', 'notes', 'value', 'currency', 'locked', 'purchaseType', 'specialClass', 'type');
        });
      });
    });
  });
});
