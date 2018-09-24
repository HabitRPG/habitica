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
          _.each(['key', 'text', 'notes', 'value', 'currency', 'locked', 'purchaseType', 'class'], (key) => {
            expect(_.has(item, key)).to.eql(true);
          });
        });
      });
    });

    it('shows relevant non class gear in special category', () => {
      let contributor = generateUser({
        contributor: {
          level: 7,
          critical: true,
        },
        items: {
          gear: {
            owned: {
              weapon_armoire_basicCrossbow: true, // eslint-disable-line camelcase
            },
          },
        },
      });

      let gearCategories = shared.shops.getMarketGearCategories(contributor);
      let specialCategory = gearCategories.find(o => o.identifier === 'none');
      expect(specialCategory.items.find((item) => item.key === 'weapon_special_1'));
      expect(specialCategory.items.find((item) => item.key === 'armor_special_1'));
      expect(specialCategory.items.find((item) => item.key === 'head_special_1'));
      expect(specialCategory.items.find((item) => item.key === 'shield_special_1'));
      expect(specialCategory.items.find((item) => item.key === 'weapon_special_critical'));
      expect(specialCategory.items.find((item) => item.key === 'weapon_armoire_basicCrossbow'));// eslint-disable-line camelcase
    });

    it('does not show gear when it is all owned', () => {
      let userWithItems = generateUser({
        stats: {
          class: 'wizard',
        },
        items: {
          gear: {
            owned: {
              weapon_wizard_0: true, // eslint-disable-line camelcase
              weapon_wizard_1: true, // eslint-disable-line camelcase
              weapon_wizard_2: true, // eslint-disable-line camelcase
              weapon_wizard_3: true, // eslint-disable-line camelcase
              weapon_wizard_4: true, // eslint-disable-line camelcase
              weapon_wizard_5: true, // eslint-disable-line camelcase
              weapon_wizard_6: true, // eslint-disable-line camelcase
              armor_wizard_1: true, // eslint-disable-line camelcase
              armor_wizard_2: true, // eslint-disable-line camelcase
              armor_wizard_3: true, // eslint-disable-line camelcase
              armor_wizard_4: true, // eslint-disable-line camelcase
              armor_wizard_5: true, // eslint-disable-line camelcase
              head_wizard_1: true, // eslint-disable-line camelcase
              head_wizard_2: true, // eslint-disable-line camelcase
              head_wizard_3: true, // eslint-disable-line camelcase
              head_wizard_4: true, // eslint-disable-line camelcase
              head_wizard_5: true, // eslint-disable-line camelcase
            },
          },
        },
      });


      let shopWizardItems = shared.shops.getMarketGearCategories(userWithItems).find(x => x.identifier === 'wizard').items.filter(x => x.klass === 'wizard' && (x.owned === false || x.owned === undefined));
      expect(shopWizardItems.length).to.eql(0);
    });

    it('shows available gear not yet purchased and previously owned', () => {
      let userWithItems = generateUser({
        stats: {
          class: 'wizard',
        },
        items: {
          gear: {
            owned: {
              weapon_wizard_0: true, // eslint-disable-line camelcase
              weapon_wizard_1: true, // eslint-disable-line camelcase
              weapon_wizard_2: true, // eslint-disable-line camelcase
              weapon_wizard_3: true, // eslint-disable-line camelcase
              weapon_wizard_4: true, // eslint-disable-line camelcase
              armor_wizard_1: true, // eslint-disable-line camelcase
              armor_wizard_2: true, // eslint-disable-line camelcase
              armor_wizard_3: false, // eslint-disable-line camelcase
              armor_wizard_4: false, // eslint-disable-line camelcase
              head_wizard_1: true, // eslint-disable-line camelcase
              head_wizard_2: false, // eslint-disable-line camelcase
              head_wizard_3: true, // eslint-disable-line camelcase
              head_wizard_4: false, // eslint-disable-line camelcase
              head_wizard_5: true, // eslint-disable-line camelcase
            },
          },
        },
      });


      let shopWizardItems = shared.shops.getMarketGearCategories(userWithItems).find(x => x.identifier === 'wizard').items.filter(x => x.klass === 'wizard' && (x.owned === false || x.owned === undefined));
      expect(shopWizardItems.find(item => item.key === 'weapon_wizard_5').locked).to.eql(false);
      expect(shopWizardItems.find(item => item.key === 'weapon_wizard_6').locked).to.eql(true);
      expect(shopWizardItems.find(item => item.key === 'armor_wizard_3').locked).to.eql(false);
      expect(shopWizardItems.find(item => item.key === 'armor_wizard_4').locked).to.eql(true);
      expect(shopWizardItems.find(item => item.key === 'head_wizard_2').locked).to.eql(false);
      expect(shopWizardItems.find(item => item.key === 'head_wizard_4').locked).to.eql(true);
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
        if (category.identifier === 'bundle') {
          _.each(category.items, (item) => {
            _.each(['key', 'text', 'notes', 'value', 'currency', 'purchaseType', 'class'], (key) => {
              expect(_.has(item, key)).to.eql(true);
            });
          });
        } else {
          _.each(category.items, (item) => {
            _.each(['key', 'text', 'notes', 'value', 'currency', 'locked', 'purchaseType', 'boss', 'class', 'collect', 'drop', 'unlockCondition', 'lvl'], (key) => {
              expect(_.has(item, key)).to.eql(true);
            });
          });
        }
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
          _.each(['key', 'text', 'value', 'currency', 'locked', 'purchaseType', 'class', 'notes', 'class'], (key) => {
            expect(_.has(item, key)).to.eql(true);
          });
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
          _.each(['key', 'text', 'notes', 'value', 'currency', 'locked', 'purchaseType', 'type'], (key) => {
            expect(_.has(item, key)).to.eql(true);
          });
        });
      });
    });
  });
});
