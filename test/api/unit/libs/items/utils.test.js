/* eslint-disable camelcase */
import {
  validateItemPath,
  getDefaultOwnedGear,
} from '../../../../../website/server/libs/items/utils';

describe('Items Utils', () => {
  describe('getDefaultOwnedGear', () => {
    it('clones the result object', () => {
      const res1 = getDefaultOwnedGear();
      res1.extraProperty = true;

      const res2 = getDefaultOwnedGear();
      expect(res2).not.to.have.property('extraProperty');
    });
  });

  describe('validateItemPath', () => {
    it('returns false if not an item path', () => {
      expect(validateItemPath('notitems.gear.owned.item')).to.equal(false);
    });

    it('returns true if a valid schema path', () => {
      expect(validateItemPath('items.gear.equipped.weapon')).to.equal(true);
      expect(validateItemPath('items.currentPet')).to.equal(true);
      expect(validateItemPath('items.special.snowball')).to.equal(true);
    });

    it('works with owned gear paths', () => {
      expect(validateItemPath('items.gear.owned.head_armoire_crownOfHearts')).to.equal(true);
      expect(validateItemPath('items.gear.owned.head_invalid')).to.equal(false);
    });

    it('works with pets paths', () => {
      expect(validateItemPath('items.pets.Wolf-CottonCandyPink')).to.equal(true);
      expect(validateItemPath('items.pets.Wolf-Invalid')).to.equal(false);
    });

    it('works with eggs paths', () => {
      expect(validateItemPath('items.eggs.LionCub')).to.equal(true);
      expect(validateItemPath('items.eggs.Armadillo')).to.equal(true);
      expect(validateItemPath('items.eggs.NotAnArmadillo')).to.equal(false);
    });

    it('works with hatching potions paths', () => {
      expect(validateItemPath('items.hatchingPotions.Base')).to.equal(true);
      expect(validateItemPath('items.hatchingPotions.StarryNight')).to.equal(true);
      expect(validateItemPath('items.hatchingPotions.Invalid')).to.equal(false);
    });

    it('works with food paths', () => {
      expect(validateItemPath('items.food.Cake_Base')).to.equal(true);
      expect(validateItemPath('items.food.Cake_Invalid')).to.equal(false);
    });

    it('works with mounts paths', () => {
      expect(validateItemPath('items.mounts.Cactus-Base')).to.equal(true);
      expect(validateItemPath('items.mounts.Aether-Invisible')).to.equal(true);
      expect(validateItemPath('items.mounts.Aether-Invalid')).to.equal(false);
    });

    it('works with quests paths', () => {
      expect(validateItemPath('items.quests.atom3')).to.equal(true);
      expect(validateItemPath('items.quests.invalid')).to.equal(false);
    });
  });
});
