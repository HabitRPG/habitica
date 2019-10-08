import {
  each,
} from 'lodash';
import {
  expectValidTranslationString,
} from '../helpers/content.helper';
import t from '../../website/common/script/content/translation';

import * as stable from '../../website/common/script/content/stable';
import * as eggs from '../../website/common/script/content/eggs';
import * as potions from '../../website/common/script/content/hatching-potions';

describe('stable', () => {
  describe('dropPets', () => {
    it('contains a pet for each drop potion * each drop egg', () => {
      const numberOfDropPotions = Object.keys(potions.drops).length;
      const numberOfDropEggs = Object.keys(eggs.drops).length;
      const numberOfDropPets = Object.keys(stable.dropPets).length;
      const expectedTotal = numberOfDropPotions * numberOfDropEggs;

      expect(numberOfDropPets).to.be.greaterThan(0);
      expect(numberOfDropPets).to.equal(expectedTotal);
    });
  });

  describe('questPets', () => {
    it('contains a pet for each drop potion * each quest egg', () => {
      const numberOfDropPotions = Object.keys(potions.drops).length;
      const numberOfQuestEggs = Object.keys(eggs.quests).length;
      const numberOfQuestPets = Object.keys(stable.questPets).length;
      const expectedTotal = numberOfDropPotions * numberOfQuestEggs;

      expect(numberOfQuestPets).to.be.greaterThan(0);
      expect(numberOfQuestPets).to.equal(expectedTotal);
    });
  });

  describe('premiumPets', () => {
    it('contains a pet for each premium potion * each drop egg', () => {
      const numberOfPremiumPotions = Object.keys(potions.premium).length;
      const numberOfDropEggs = Object.keys(eggs.drops).length;
      const numberOfPremiumPets = Object.keys(stable.premiumPets).length;
      const expectedTotal = numberOfPremiumPotions * numberOfDropEggs;

      expect(numberOfPremiumPets).to.be.greaterThan(0);
      expect(numberOfPremiumPets).to.equal(expectedTotal);
    });
  });

  describe('wackyPets', () => {
    it('contains a pet for each wacky potion * each drop egg', () => {
      const numberOfWackyPotions = Object.keys(potions.wacky).length;
      const numberOfDropEggs = Object.keys(eggs.drops).length;
      const numberOfWackyPets = Object.keys(stable.wackyPets).length;
      const expectedTotal = numberOfWackyPotions * numberOfDropEggs;

      expect(numberOfWackyPets).to.be.greaterThan(0);
      expect(numberOfWackyPets).to.equal(expectedTotal);
    });
  });

  describe('specialPets', () => {
    it('each value is a valid translation string', () => {
      each(stable.specialPets, pet => {
        const string = t(pet);
        expectValidTranslationString(string);
      });
    });
  });

  describe('dropMounts', () => {
    it('contains a mount for each drop potion * each drop egg', () => {
      const numberOfDropPotions = Object.keys(potions.drops).length;
      const numberOfDropEggs = Object.keys(eggs.drops).length;
      const numberOfDropMounts = Object.keys(stable.dropMounts).length;
      const expectedTotal = numberOfDropPotions * numberOfDropEggs;

      expect(numberOfDropMounts).to.be.greaterThan(0);
      expect(numberOfDropMounts).to.equal(expectedTotal);
    });
  });

  describe('questMounts', () => {
    it('contains a mount for each drop potion * each quest egg', () => {
      const numberOfDropPotions = Object.keys(potions.drops).length;
      const numberOfQuestEggs = Object.keys(eggs.quests).length;
      const numberOfQuestMounts = Object.keys(stable.questMounts).length;
      const expectedTotal = numberOfDropPotions * numberOfQuestEggs;

      expect(numberOfQuestMounts).to.be.greaterThan(0);
      expect(numberOfQuestMounts).to.equal(expectedTotal);
    });
  });

  describe('premiumMounts', () => {
    it('contains a mount for each premium potion * each drop egg', () => {
      const numberOfPremiumPotions = Object.keys(potions.premium).length;
      const numberOfDropEggs = Object.keys(eggs.drops).length;
      const numberOfPremiumMounts = Object.keys(stable.premiumMounts).length;
      const expectedTotal = numberOfPremiumPotions * numberOfDropEggs;

      expect(numberOfPremiumMounts).to.be.greaterThan(0);
      expect(numberOfPremiumMounts).to.equal(expectedTotal);
    });
  });

  describe('specialMounts', () => {
    it('each value is a valid translation string', () => {
      each(stable.specialMounts, mount => {
        const string = t(mount);
        expectValidTranslationString(string);
      });
    });
  });

  describe('petInfo', () => {
    it('contains an entry for all pets', () => {
      const dropNumber = Object.keys(stable.dropPets).length;
      const questNumber = Object.keys(stable.questPets).length;
      const specialNumber = Object.keys(stable.specialPets).length;
      const premiumNumber = Object.keys(stable.premiumPets).length;
      const wackyNumber = Object.keys(stable.wackyPets).length;
      const allNumber = Object.keys(stable.petInfo).length;

      expect(allNumber).to.be.greaterThan(0);
      expect(allNumber).to.equal(
        dropNumber + questNumber + specialNumber + premiumNumber + wackyNumber,
      );
    });

    it('contains basic information about each pet', () => {
      each(stable.petInfo, (pet, key) => {
        expectValidTranslationString(pet.text);
        expect(pet.type).to.be.a('string');
        expect(pet.key).to.equal(key);
      });
    });
  });

  describe('mountInfo', () => {
    it('contains an entry for all mounts', () => {
      const dropNumber = Object.keys(stable.dropMounts).length;
      const questNumber = Object.keys(stable.questMounts).length;
      const specialNumber = Object.keys(stable.specialMounts).length;
      const premiumNumber = Object.keys(stable.premiumMounts).length;
      const allNumber = Object.keys(stable.mountInfo).length;

      expect(allNumber).to.be.greaterThan(0);
      expect(allNumber).to.equal(dropNumber + questNumber + specialNumber + premiumNumber);
    });

    it('contains basic information about each mount', () => {
      each(stable.mountInfo, (mount, key) => {
        expectValidTranslationString(mount.text);
        expect(mount.type).to.be.a('string');
        expect(mount.key).to.equal(key);
      });
    });
  });
});
