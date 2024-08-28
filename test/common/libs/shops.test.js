import shared from '../../../website/common';
import {
  generateUser,
} from '../../helpers/common.helper';

import seasonalConfig from '../../../website/common/script/libs/shops-seasonal.config';

describe('shops', () => {
  const user = generateUser();
  let clock;

  afterEach(() => {
    if (clock) {
      clock.restore();
    }
    user.achievements.quests = {};
  });

  describe('market', () => {
    const shopCategories = shared.shops.getMarketCategories(user);

    it('contains at least the 3 default categories', () => {
      expect(shopCategories.length).to.be.greaterThan(2);
    });

    it('does not contain an empty category', () => {
      _.each(shopCategories, category => {
        expect(category.items.length).to.be.greaterThan(0);
      });
    });

    it('does not duplicate identifiers', () => {
      const identifiers = Array.from(new Set(shopCategories.map(cat => cat.identifier)));

      expect(identifiers.length).to.eql(shopCategories.length);
    });

    it('items contain required fields', () => {
      _.each(shopCategories, category => {
        _.each(category.items, item => {
          _.each(['key', 'text', 'notes', 'value', 'currency', 'locked', 'purchaseType', 'class'], key => {
            expect(_.has(item, key)).to.eql(true);
          });
        });
      });
    });

    describe('premium hatching potions', () => {
      it('contains current scheduled premium hatching potions', async () => {
        clock = sinon.useFakeTimers(new Date('2024-04-01T09:00:00.000Z'));
        const potions = shared.shops.getMarketCategories(user).find(x => x.identifier === 'premiumHatchingPotions');
        expect(potions.items.length).to.eql(3);
      });

      it('does not contain past scheduled premium hatching potions', async () => {
        clock = sinon.useFakeTimers(new Date('2024-04-01T09:00:00.000Z'));
        const potions = shared.shops.getMarketCategories(user).find(x => x.identifier === 'premiumHatchingPotions');
        expect(potions.items.filter(x => x.key === 'Aquatic' || x.key === 'Celestial').length, 'Aquatic or Celestial found').to.eql(0);
      });

      it('returns end date for scheduled premium potions', async () => {
        const potions = shared.shops.getMarketCategories(user).find(x => x.identifier === 'premiumHatchingPotions');
        potions.items.forEach(potion => {
          expect(potion.end).to.exist;
        });
      });

      it('contains unlocked quest premium hatching potions', async () => {
        user.achievements.quests = {
          bronze: 1,
          blackPearl: 1,
        };
        const potions = shared.shops.getMarketCategories(user).find(x => x.identifier === 'premiumHatchingPotions');
        expect(potions.items.filter(x => x.key === 'Bronze' || x.key === 'BlackPearl').length).to.eql(2);
      });

      it('does not contain locked quest premium hatching potions', async () => {
        clock = sinon.useFakeTimers(new Date('2024-04-01T09:00:00.000Z'));
        const potions = shared.shops.getMarketCategories(user).find(x => x.identifier === 'premiumHatchingPotions');
        expect(potions.items.length).to.eql(3);
        expect(potions.items.filter(x => x.key === 'Bronze' || x.key === 'BlackPearl').length).to.eql(0);
      });

      it('does not return end date for quest premium potions', async () => {
        user.achievements.quests = {
          bronze: 1,
          blackPearl: 1,
        };
        const potions = shared.shops.getMarketCategories(user).find(x => x.identifier === 'premiumHatchingPotions');
        potions.items.filter(x => x.key === 'Bronze' || x.key === 'BlackPearl').forEach(potion => {
          expect(potion.end).to.not.exist;
        });
      });
    });

    it('does not return items with event data', async () => {
      shopCategories.forEach(category => {
        category.items.forEach(item => {
          expect(item.event).to.not.exist;
          expect(item.season).to.not.exist;
        });
      });
    });

    it('shows relevant non class gear in special category', () => {
      const contributor = generateUser({
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

      const gearCategories = shared.shops.getMarketGearCategories(contributor);
      const specialCategory = gearCategories.find(o => o.identifier === 'none');
      expect(specialCategory.items.find(item => item.key === 'weapon_special_1'), 'weapon_special_1');
      expect(specialCategory.items.find(item => item.key === 'armor_special_1'), 'armor_special_1');
      expect(specialCategory.items.find(item => item.key === 'head_special_1'), 'head_special_1');
      expect(specialCategory.items.find(item => item.key === 'shield_special_1'), 'shield_special_1');
      expect(specialCategory.items.find(item => item.key === 'weapon_special_critical'), 'weapon_special_critical');
      expect(specialCategory.items.find(item => item.key === 'weapon_armoire_basicCrossbow'), 'weapon_armoire_basicCrossbow');// eslint-disable-line camelcase
    });

    describe('handles seasonal gear', () => {
      beforeEach(() => {
        clock = sinon.useFakeTimers(new Date('2024-04-01'));
      });

      it('shows current seasonal gear for warriors', () => {
        const warriorItems = shared.shops.getMarketGearCategories(user).find(x => x.identifier === 'warrior').items.filter(x => x.key.indexOf('spring2024') !== -1);
        expect(warriorItems.length, 'Warrior seasonal gear').to.eql(4);
      });

      it('shows current seasonal gear for mages', () => {
        const mageItems = shared.shops.getMarketGearCategories(user).find(x => x.identifier === 'wizard').items.filter(x => x.key.indexOf('spring2024') !== -1);
        expect(mageItems.length, 'Mage seasonal gear').to.eql(3);
      });

      it('shows current seasonal gear for healers', () => {
        const healerItems = shared.shops.getMarketGearCategories(user).find(x => x.identifier === 'healer').items.filter(x => x.key.indexOf('spring2024') !== -1);
        expect(healerItems.length, 'Healer seasonal gear').to.eql(4);
      });

      it('shows current seasonal gear for rogues', () => {
        const rogueItems = shared.shops.getMarketGearCategories(user).find(x => x.identifier === 'rogue').items.filter(x => x.key.indexOf('spring2024') !== -1);
        expect(rogueItems.length, 'Rogue seasonal gear').to.eql(4);
      });

      it('seasonal gear contains end date', () => {
        const categories = shared.shops.getMarketGearCategories(user);
        categories.forEach(category => {
          category.items.filter(x => x.key.indexOf('spring2024') !== -1).forEach(item => {
            expect(item.end, item.key).to.exist;
          });
        });
      });

      it('only shows gear for the current season', () => {
        const categories = shared.shops.getMarketGearCategories(user);
        categories.forEach(category => {
          const otherSeasons = category.items.filter(item => item.key.indexOf('winter') !== -1 || item.key.indexOf('summer') !== -1 || item.key.indexOf('fall') !== -1);
          expect(otherSeasons.length).to.eql(0);
        });
      });

      it('does not show gear from past seasons', () => {
        const categories = shared.shops.getMarketGearCategories(user);
        categories.forEach(category => {
          const otherYears = category.items.filter(item => item.key.indexOf('spring') !== -1 && item.key.indexOf('2024') === -1);
          expect(otherYears.length).to.eql(0);
        });
      });
    });

    it('does not show gear when it is all owned', () => {
      const userWithItems = generateUser({
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

      const shopWizardItems = shared.shops.getMarketGearCategories(userWithItems).find(x => x.identifier === 'wizard').items.filter(x => x.klass === 'wizard' && (x.owned === false || x.owned === undefined));
      expect(shopWizardItems.length).to.eql(0);
    });

    it('shows available gear not yet purchased and previously owned', () => {
      const userWithItems = generateUser({
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

      const shopWizardItems = shared.shops.getMarketGearCategories(userWithItems).find(x => x.identifier === 'wizard').items.filter(x => x.klass === 'wizard' && (x.owned === false || x.owned === undefined));
      expect(shopWizardItems.find(item => item.key === 'weapon_wizard_5').locked).to.eql(false);
      expect(shopWizardItems.find(item => item.key === 'weapon_wizard_6').locked).to.eql(true);
      expect(shopWizardItems.find(item => item.key === 'armor_wizard_3').locked).to.eql(false);
      expect(shopWizardItems.find(item => item.key === 'armor_wizard_4').locked).to.eql(true);
      expect(shopWizardItems.find(item => item.key === 'head_wizard_2').locked).to.eql(false);
      expect(shopWizardItems.find(item => item.key === 'head_wizard_4').locked).to.eql(true);
    });
  });

  describe('questShop', () => {
    const shopCategories = shared.shops.getQuestShopCategories(user);

    it('does not contain an empty category', () => {
      _.each(shopCategories, category => {
        expect(category.items.length, category.identifier).to.be.greaterThan(0);
      });
    });

    it('does not duplicate identifiers', () => {
      const identifiers = Array.from(new Set(shopCategories.map(cat => cat.identifier)));

      expect(identifiers.length).to.eql(shopCategories.length);
    });

    it('items contain required fields', () => {
      _.each(shopCategories, category => {
        if (category.identifier === 'bundle') {
          _.each(category.items, item => {
            _.each(['key', 'text', 'notes', 'value', 'currency', 'purchaseType', 'class'], key => {
              expect(_.has(item, key)).to.eql(true);
            });
          });
        } else {
          _.each(category.items, item => {
            _.each(['key', 'text', 'notes', 'value', 'currency', 'locked', 'purchaseType', 'boss', 'class', 'collect', 'drop', 'unlockCondition', 'lvl'], key => {
              expect(_.has(item, key)).to.eql(true);
            });
          });
        }
      });
    });

    it('does not return items with event data', async () => {
      shopCategories.forEach(category => {
        category.items.forEach(item => {
          expect(item.event).to.not.exist;
        });
      });
    });
  });

  describe('timeTravelers', () => {
    const shopCategories = shared.shops.getTimeTravelersCategories(user);

    it('does not contain an empty category', () => {
      _.each(shopCategories, category => {
        expect(category.items.length).to.be.greaterThan(0);
      });
    });

    it('does not duplicate identifiers', () => {
      const identifiers = Array.from(new Set(shopCategories.map(cat => cat.identifier)));

      expect(identifiers.length).to.eql(shopCategories.length);
    });

    it('items contain required fields', () => {
      _.each(shopCategories, category => {
        _.each(category.items, item => {
          _.each(['key', 'text', 'value', 'currency', 'locked', 'purchaseType', 'class', 'notes', 'class'], key => {
            expect(_.has(item, key)).to.eql(true);
          });
        });
      });
    });

    it('does not return items with event data', async () => {
      shopCategories.forEach(category => {
        category.items.forEach(item => {
          expect(item.event).to.not.exist;
        });
      });
    });

    it('returns pets', () => {
      const pets = shopCategories.find(cat => cat.identifier === 'pets').items;
      expect(pets.length).to.be.greaterThan(0);
    });

    it('returns mounts', () => {
      const mounts = shopCategories.find(cat => cat.identifier === 'mounts').items;
      expect(mounts.length).to.be.greaterThan(0);
    });

    it('returns quests', () => {
      const quests = shopCategories.find(cat => cat.identifier === 'quests').items;
      expect(quests.length).to.be.greaterThan(0);
    });

    it('returns backgrounds', () => {
      const backgrounds = shopCategories.find(cat => cat.identifier === 'backgrounds').items;
      expect(backgrounds.length).to.be.greaterThan(0);
    });

    it('does not add an end date to steampunk gear', () => {
      const categories = shopCategories.filter(cat => cat.identifier.startsWith('30'));
      categories.forEach(category => {
        expect(category.end).to.not.exist;
        category.items.forEach(item => {
          expect(item.end).to.not.exist;
        });
      });
    });
  });

  describe('customizationShop', () => {
    const shopCategories = shared.shops.getCustomizationsShopCategories(user, null);

    it('does not return items with event data', async () => {
      shopCategories.forEach(category => {
        category.items.forEach(item => {
          expect(item.event, item.key).to.not.exist;
        });
      });
    });

    it('backgrounds category contains end date', () => {
      const backgroundCategory = shopCategories.find(cat => cat.identifier === 'backgrounds');
      expect(backgroundCategory.end).to.exist;
      expect(backgroundCategory.end).to.be.greaterThan(new Date());
    });

    it('hair color category contains end date', () => {
      const colorCategory = shopCategories.find(cat => cat.identifier === 'color');
      expect(colorCategory.end).to.exist;
      expect(colorCategory.end).to.be.greaterThan(new Date());
    });

    it('skin category contains end date', () => {
      const colorCategory = shopCategories.find(cat => cat.identifier === 'color');
      expect(colorCategory.end).to.exist;
      expect(colorCategory.end).to.be.greaterThan(new Date());
    });
  });

  describe('seasonalShop', () => {
    const shopCategories = shared.shops.getSeasonalShopCategories(user, null, seasonalConfig());
    const today = new Date();

    it('does not contain an empty category', () => {
      _.each(shopCategories, category => {
        expect(category.items.length).to.be.greaterThan(0);
      });
    });

    it('does not duplicate identifiers', () => {
      const identifiers = Array.from(new Set(shopCategories.map(cat => cat.identifier)));

      expect(identifiers.length).to.eql(shopCategories.length);
    });

    it('does not return items with event data', async () => {
      shopCategories.forEach(category => {
        category.items.forEach(item => {
          expect(item.event, item.key).to.not.exist;
        });
      });
    });

    it('items contain required fields', () => {
      _.each(shopCategories, category => {
        _.each(category.items, item => {
          _.each(['key', 'text', 'notes', 'value', 'currency', 'locked', 'purchaseType', 'type'], key => {
            expect(_.has(item, key), item.key).to.eql(true);
          });
        });
      });
    });

    it('items have a valid end date', () => {
      shopCategories.forEach(category => {
        category.items.forEach(item => {
          expect(item.end, item.key).to.be.a('date');
          expect(item.end, item.key).to.be.greaterThan(today);
        });
      });
    });

    it('items match current season', () => {
      const currentSeason = seasonalConfig().currentSeason.toLowerCase();
      shopCategories.forEach(category => {
        category.items.forEach(item => {
          if (item.klass === 'special') {
            expect(item.season, item.key).to.eql(currentSeason);
          }
        });
      });
    });
  });
});
