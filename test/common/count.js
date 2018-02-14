/* eslint-disable camelcase */
let count = require('../../website/common/script/count');

describe('count', () => {
  describe('beastMasterProgress', () => {
    it('returns 0 if no pets', () => {
      let pets = {};
      let beastMasterTotal = count.beastMasterProgress(pets);

      expect(beastMasterTotal).to.eql(0);
    });

    it('counts drop pets', () => {
      let pets = { 'Dragon-Red': 1, 'Wolf-Base': 2 };
      let beastMasterTotal = count.beastMasterProgress(pets);

      expect(beastMasterTotal).to.eql(2);
    });

    it('does not count quest pets', () => {
      let pets = { 'Dragon-Red': 1, 'Gryphon-Base': 1 };
      let beastMasterTotal = count.beastMasterProgress(pets);

      expect(beastMasterTotal).to.eql(1);
    });

    it('does not count pets hatched with premium potions', () => {
      let pets = {
        'Wolf-Spooky': 5,
        'Dragon-Spooky': 5,
        'FlyingPig-Base': 5,
      };
      let beastMasterTotal = count.beastMasterProgress(pets);

      expect(beastMasterTotal).to.eql(1);
    });

    it('does not count special pets', () => {
      let pets = {
        'Wolf-Base': 2,
        'Wolf-Veteran': 1,
        'Wolf-Cerberus': 1,
        'Dragon-Hydra': 1,
      };
      let beastMasterTotal = count.beastMasterProgress(pets);

      expect(beastMasterTotal).to.eql(1);
    });

    it('counts drop pets that have been raised to a mount', () => {
      let raisedToMount = -1;
      let pets = { 'Dragon-Red': 1, 'Wolf-Base': raisedToMount };
      let beastMasterTotal = count.beastMasterProgress(pets);

      expect(beastMasterTotal).to.eql(2);
    });

    it('does not counts drop pets that have been released', () => {
      let releasedPet = 0;
      let pets = { 'Dragon-Red': 1, 'Wolf-Base': releasedPet };
      let beastMasterTotal = count.beastMasterProgress(pets);

      expect(beastMasterTotal).to.eql(1);
    });
  });

  describe('mountMasterProgress', () => {
    it('returns 0 if no mounts', () => {
      let mounts = {};
      let mountMasterTotal = count.mountMasterProgress(mounts);

      expect(mountMasterTotal).to.eql(0);
    });

    it('counts drop mounts', () => {
      let mounts = { 'Dragon-Red': true, 'Wolf-Base': true };
      let mountMasterTotal = count.mountMasterProgress(mounts);

      expect(mountMasterTotal).to.eql(2);
    });

    it('does not count premium mounts', () => {
      let mounts = {
        'Dragon-Red': true,
        'FlyingPig-Spooky': true,
      };
      let mountMasterTotal = count.mountMasterProgress(mounts);

      expect(mountMasterTotal).to.eql(1);
    });

    it('does not count quest mounts', () => {
      let mounts = { 'Dragon-Red': true, 'Gryphon-Base': true };
      let mountMasterTotal = count.mountMasterProgress(mounts);

      expect(mountMasterTotal).to.eql(1);
    });

    it('does not count special mounts', () => {
      let mounts = { 'Wolf-Base': true, 'BearCub-Polar': true};
      let mountMasterTotal = count.mountMasterProgress(mounts);

      expect(mountMasterTotal).to.eql(1);
    });

    it('only counts drop mounts that are currently owned', () => {
      let notCurrentlyOwned = false;
      let mounts = { 'Dragon-Red': true, 'Wolf-Base': notCurrentlyOwned };
      let mountMasterTotal = count.mountMasterProgress(mounts);

      expect(mountMasterTotal).to.eql(1);
    });
  });

  describe('remainingGearInSet', () => {
    it('counts remaining gear based on set', () => {
      let gear = {
        weapon_wizard_0: true,
        weapon_wizard_1: true,
        weapon_warrior_0: true,
        weapon_warrior_1: true,
        weapon_armor_0: true,
        weapon_armor_1: true,
      };

      let armoireCount = count.remainingGearInSet(gear, 'warrior');

      expect(armoireCount).to.eql(20);
    });

    it.skip('includes previously owned items in count (https: //github.com/HabitRPG/habitrpg/issues/5624#issuecomment-124018717)', () => {
      let gear = {
        weapon_warrior_0: false,
        weapon_warrior_1: false,
        weapon_armor_0: true,
        weapon_armor_1: true,
      };

      let armoireCount = count.remainingGearInSet(gear, 'warrior');

      expect(armoireCount).to.eql(20);
    });
  });

  describe('dropPetsCurrentlyOwned', () => {
    it('counts drop pets owned', () => {
      let pets = {
        'Wolf-Base': 2,
        'Wolf-Red': 4,
      };
      let dropPets = count.dropPetsCurrentlyOwned(pets);

      expect(dropPets).to.eql(2);
    });

    it('does not count pets that have been raised to mounts', () => {
      let pets = {
        'Wolf-Base': -1,
        'Wolf-Red': 4,
        'Wolf-Veteran': 1,
        'Gryphon-Base': 1,
      };
      let dropPets = count.dropPetsCurrentlyOwned(pets);

      expect(dropPets).to.eql(1);
    });

    it('does not count quest pets', () => {
      let pets = {
        'Wolf-Base': 2,
        'Wolf-Red': 4,
        'Gryphon-Base': 1,
      };
      let dropPets = count.dropPetsCurrentlyOwned(pets);

      expect(dropPets).to.eql(2);
    });

    it('does not count special pets', () => {
      let pets = {
        'Wolf-Base': 2,
        'Wolf-Red': 4,
        'Wolf-Veteran': 1,
      };
      let dropPets = count.dropPetsCurrentlyOwned(pets);

      expect(dropPets).to.eql(2);
    });
  });

  describe('questsOfCategory', () => {
    it('counts user quest scrolls of a particular category', () => {
      let quests = {
        atom1: 2,
        whale: 4,
        kraken: 2,
        sheep: 1,
        goldenknight2: 1,
      };
      let petQuestCount = count.questsOfCategory(quests, 'pet');
      let unlockableQuestCount = count.questsOfCategory(quests, 'unlockable');
      let goldQuestCount = count.questsOfCategory(quests, 'gold');

      expect(petQuestCount).to.eql(3);
      expect(unlockableQuestCount).to.eql(2);
      expect(goldQuestCount).to.eql(0);
    });
  });
});
