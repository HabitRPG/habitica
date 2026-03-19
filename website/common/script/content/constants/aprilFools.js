import eggs from '../eggs';
import stable from '../stable';

const SWAPS = [
  'Veggie',
  'Dessert',
  'VirtualPet',
  'TeaShop',
  'Fungi',
  'Cryptid',
  'Alien',
];

export function getMatchingSwap (date = new Date()) {
  const year = date.getFullYear();
  const diff = year - 2020;
  return SWAPS[diff % SWAPS.length];
}

export function makeSubstitutionMap (swappedPotion) {
  const substitutions = {
    pets: {
      default: `Pet-Dragon-${swappedPotion}`,
      noPet: `Pet-Wolf-${swappedPotion}`,
      noPetIOS: `Pet-TigerCub-${swappedPotion}`,
      noPetAndroid: `Pet-Cactus-${swappedPotion}`,
    },
  };
  for (const pet of Object.keys(stable.specialPets)) {
    substitutions.pets[`Pet-${pet}`] = `Pet-Dragon-${swappedPotion}`;
  }
  for (const egg of Object.keys(eggs.drops)) {
    substitutions.pets[`Pet-${egg}-`] = `Pet-${egg}-${swappedPotion}`;
  }
  for (const egg of Object.keys(eggs.quests)) {
    substitutions.pets[`Pet-${egg}-`] = `Pet-BearCub-${swappedPotion}`;
  }
  return substitutions;
}
