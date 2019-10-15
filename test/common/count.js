/* eslint-disable camelcase */
import * as count from '../../website/common/script/count';

describe('count', () => {
  describe('beastMasterProgress', () => {
    it('returns 0 if no pets', () => {
      const pets = {};
      const beastMasterTotal = count.beastMasterProgress(pets);

      expect(beastMasterTotal).to.eql(0);
    });

    it('counts drop pets', () => {
      const pets = { 'Dragon-Red': 1, 'Wolf-Base': 2 };
      const beastMasterTotal = count.beastMasterProgress(pets);

      expect(beastMasterTotal).to.eql(2);
    });

    it('does not count quest pets', () => {
      const pets = { 'Dragon-Red': 1, 'Gryphon-Base': 1 };
      const beastMasterTotal = count.beastMasterProgress(pets);

      expect(beastMasterTotal).to.eql(1);
    });

    it('does not count pets hatched with premium potions', () => {
      const pets = {
        'Wolf-Spooky': 5,
        'Dragon-Spooky': 5,
        'FlyingPig-Base': 5,
      };
      const beastMasterTotal = count.beastMasterProgress(pets);

      expect(beastMasterTotal).to.eql(1);
    });

    it('does not count special pets', () => {
      const pets = {
        'Wolf-Base': 2,
        'Wolf-Veteran': 1,
        'Wolf-Cerberus': 1,
        'Dragon-Hydra': 1,
      };
      const beastMasterTotal = count.beastMasterProgress(pets);

      expect(beastMasterTotal).to.eql(1);
    });

    it('counts drop pets that have been raised to a mount', () => {
      const raisedToMount = -1;
      const pets = { 'Dragon-Red': 1, 'Wolf-Base': raisedToMount };
      const beastMasterTotal = count.beastMasterProgress(pets);

      expect(beastMasterTotal).to.eql(2);
    });

    it('does not counts drop pets that have been released', () => {
      const releasedPet = 0;
      const pets = { 'Dragon-Red': 1, 'Wolf-Base': releasedPet };
      const beastMasterTotal = count.beastMasterProgress(pets);

      expect(beastMasterTotal).to.eql(1);
    });
  });

  describe('mountMasterProgress', () => {
    it('returns 0 if no mounts', () => {
      const mounts = {};
      const mountMasterTotal = count.mountMasterProgress(mounts);

      expect(mountMasterTotal).to.eql(0);
    });

    it('counts drop mounts', () => {
      const mounts = { 'Dragon-Red': true, 'Wolf-Base': true };
      const mountMasterTotal = count.mountMasterProgress(mounts);

      expect(mountMasterTotal).to.eql(2);
    });

    it('does not count premium mounts', () => {
      const mounts = {
        'Dragon-Red': true,
        'FlyingPig-Spooky': true,
      };
      const mountMasterTotal = count.mountMasterProgress(mounts);

      expect(mountMasterTotal).to.eql(1);
    });

    it('does not count quest mounts', () => {
      const mounts = { 'Dragon-Red': true, 'Gryphon-Base': true };
      const mountMasterTotal = count.mountMasterProgress(mounts);

      expect(mountMasterTotal).to.eql(1);
    });

    it('does not count special mounts', () => {
      const mounts = { 'Wolf-Base': true, 'BearCub-Polar': true };
      const mountMasterTotal = count.mountMasterProgress(mounts);

      expect(mountMasterTotal).to.eql(1);
    });

    it('only counts drop mounts that are currently owned', () => {
      const notCurrentlyOwned = false;
      const mounts = { 'Dragon-Red': true, 'Wolf-Base': notCurrentlyOwned };
      const mountMasterTotal = count.mountMasterProgress(mounts);

      expect(mountMasterTotal).to.eql(1);
    });
  });

  describe('remainingGearInSet', () => {
    it('counts remaining gear based on set', () => {
      const gear = {
        weapon_wizard_0: true,
        weapon_wizard_1: true,
        weapon_warrior_0: true,
        weapon_warrior_1: true,
        weapon_armor_0: true,
        weapon_armor_1: true,
      };

      const armoireCount = count.remainingGearInSet(gear, 'warrior');

      expect(armoireCount).to.eql(20);
    });

    it.skip('includes previously owned items in count (https: //github.com/HabitRPG/habitrpg/issues/5624#issuecomment-124018717)', () => {
      const gear = {
        weapon_warrior_0: false,
        weapon_warrior_1: false,
        weapon_armor_0: true,
        weapon_armor_1: true,
      };

      const armoireCount = count.remainingGearInSet(gear, 'warrior');

      expect(armoireCount).to.eql(20);
    });
  });

  describe('dropPetsCurrentlyOwned', () => {
    it('counts drop pets owned', () => {
      const pets = {
        'Wolf-Base': 2,
        'Wolf-Red': 4,
      };
      const dropPets = count.dropPetsCurrentlyOwned(pets);

      expect(dropPets).to.eql(2);
    });

    it('does not count pets that have been raised to mounts', () => {
      const pets = {
        'Wolf-Base': -1,
        'Wolf-Red': 4,
        'Wolf-Veteran': 1,
        'Gryphon-Base': 1,
      };
      const dropPets = count.dropPetsCurrentlyOwned(pets);

      expect(dropPets).to.eql(1);
    });

    it('does not count quest pets', () => {
      const pets = {
        'Wolf-Base': 2,
        'Wolf-Red': 4,
        'Gryphon-Base': 1,
      };
      const dropPets = count.dropPetsCurrentlyOwned(pets);

      expect(dropPets).to.eql(2);
    });

    it('does not count special pets', () => {
      const pets = {
        'Wolf-Base': 2,
        'Wolf-Red': 4,
        'Wolf-Veteran': 1,
      };
      const dropPets = count.dropPetsCurrentlyOwned(pets);

      expect(dropPets).to.eql(2);
    });
  });

  describe('questsOfCategory', () => {
    it('counts user quest scrolls of a particular category', () => {
      const quests = {
        atom1: 2,
        whale: 4,
        kraken: 2,
        sheep: 1,
        goldenknight2: 1,
      };
      const petQuestCount = count.questsOfCategory(quests, 'pet');
      const unlockableQuestCount = count.questsOfCategory(quests, 'unlockable');
      const goldQuestCount = count.questsOfCategory(quests, 'gold');

      expect(petQuestCount).to.eql(3);
      expect(unlockableQuestCount).to.eql(2);
      expect(goldQuestCount).to.eql(0);
    });
  });
});
