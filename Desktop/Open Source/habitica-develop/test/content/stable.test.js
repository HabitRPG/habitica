import {
  each,
} from 'lodash';
import {
  expectValidTranslationString,
} from '../helpers/content.helper';
import t from '../../website/common/script/content/translation';

import stable from '../../website/common/script/content/stable';
import eggs from '../../website/common/script/content/eggs';
import potions from '../../website/common/script/content/hatching-potions';

describe('stable', ()  => {
  describe('dropPets', () => {
    it('contains a pet for each drop potion * each drop egg', () => {
      let numberOfDropPotions = Object.keys(potions.drops).length;
      let numberOfDropEggs = Object.keys(eggs.drops).length;
      let numberOfDropPets = Object.keys(stable.dropPets).length;
      let expectedTotal = numberOfDropPotions * numberOfDropEggs;

      expect(numberOfDropPets).to.be.greaterThan(0);
      expect(numberOfDropPets).to.equal(expectedTotal);
    });
  });

  describe('questPets', () => {
    it('contains a pet for each drop potion * each quest egg', () => {
      let numberOfDropPotions = Object.keys(potions.drops).length;
      let numberOfQuestEggs = Object.keys(eggs.quests).length;
      let numberOfQuestPets = Object.keys(stable.questPets).length;
      let expectedTotal = numberOfDropPotions * numberOfQuestEggs;

      expect(numberOfQuestPets).to.be.greaterThan(0);
      expect(numberOfQuestPets).to.equal(expectedTotal);
    });
  });

  describe('premiumPets', () => {
    it('contains a pet for each premium potion * each drop egg', () => {
      let numberOfPremiumPotions = Object.keys(potions.premium).length;
      let numberOfDropEggs = Object.keys(eggs.drops).length;
      let numberOfPremiumPets = Object.keys(stable.premiumPets).length;
      let expectedTotal = numberOfPremiumPotions * numberOfDropEggs;

      expect(numberOfPremiumPets).to.be.greaterThan(0);
      expect(numberOfPremiumPets).to.equal(expectedTotal);
    });
  });

  describe('specialPets', () => {
    it('each value is a valid translation string', () => {
      each(stable.specialPets, (pet) => {
        let string = t(pet);
        expectValidTranslationString(string);
      });
    });
  });

  describe('dropMounts', () => {
    it('contains a mount for each drop potion * each drop egg', () => {
      let numberOfDropPotions = Object.keys(potions.drops).length;
      let numberOfDropEggs = Object.keys(eggs.drops).length;
      let numberOfDropMounts = Object.keys(stable.dropMounts).length;
      let expectedTotal = numberOfDropPotions * numberOfDropEggs;

      expect(numberOfDropMounts).to.be.greaterThan(0);
      expect(numberOfDropMounts).to.equal(expectedTotal);
    });
  });

  describe('questMounts', () => {
    it('contains a mount for each drop potion * each quest egg', () => {
      let numberOfDropPotions = Object.keys(potions.drops).length;
      let numberOfQuestEggs = Object.keys(eggs.quests).length;
      let numberOfQuestMounts = Object.keys(stable.questMounts).length;
      let expectedTotal = numberOfDropPotions * numberOfQuestEggs;

      expect(numberOfQuestMounts).to.be.greaterThan(0);
      expect(numberOfQuestMounts).to.equal(expectedTotal);
    });
  });

  describe('premiumMounts', () => {
    it('contains a mount for each premium potion * each drop egg', () => {
      let numberOfPremiumPotions = Object.keys(potions.premium).length;
      let numberOfDropEggs = Object.keys(eggs.drops).length;
      let numberOfPremiumMounts = Object.keys(stable.premiumMounts).length;
      let expectedTotal = numberOfPremiumPotions * numberOfDropEggs;

      expect(numberOfPremiumMounts).to.be.greaterThan(0);
      expect(numberOfPremiumMounts).to.equal(expectedTotal);
    });
  });

  describe('specialMounts', () => {
    it('each value is a valid translation string', () => {
      each(stable.specialMounts, (mount) => {
        let string = t(mount);
        expectValidTranslationString(string);
      });
    });
  });

  describe('petInfo', ()  => {
    it('contains an entry for all pets', () => {
      let dropNumber = Object.keys(stable.dropPets).length;
      let questNumber = Object.keys(stable.questPets).length;
      let specialNumber = Object.keys(stable.specialPets).length;
      let premiumNumber = Object.keys(stable.premiumPets).length;
      let allNumber = Object.keys(stable.petInfo).length;

      expect(allNumber).to.be.greaterThan(0);
      expect(allNumber).to.equal(dropNumber + questNumber + specialNumber + premiumNumber);
    });

    it('contains basic information about each pet', () => {
      each(stable.petInfo, (pet, key) => {
        expectValidTranslationString(pet.text);
        expect(pet.type).to.be.a('string');
        expect(pet.key).to.equal(key);
      });
    });
  });

  describe('mountInfo', ()  => {
    it('contains an entry for all mounts', () => {
      let dropNumber = Object.keys(stable.dropMounts).length;
      let questNumber = Object.keys(stable.questMounts).length;
      let specialNumber = Object.keys(stable.specialMounts).length;
      let premiumNumber = Object.keys(stable.premiumMounts).length;
      let allNumber = Object.keys(stable.mountInfo).length;

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
