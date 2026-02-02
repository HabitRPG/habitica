import eggs from '../eggs';

export default function makeSubstitutionMap (swappedPotion) {
  const substitutions = {
    pets: {
      'Pet-Wolf-': `Pet-Wolf-${swappedPotion}`,
      'Pet-TigerCub-': `Pet-TigerCub-${swappedPotion}`,
      'Pet-PandaCub-': `Pet-PandaCub-${swappedPotion}`,
      'Pet-LionCub-': `Pet-LionCub-${swappedPotion}`,
      'Pet-Fox-': `Pet-Fox-${swappedPotion}`,
      'Pet-FlyingPig-': `Pet-FlyingPig-${swappedPotion}`,
      'Pet-Dragon-': `Pet-Dragon-${swappedPotion}`,
      'Pet-Cactus-': `Pet-Cactus-${swappedPotion}`,
      'Pet-BearCub-': `Pet-BearCub-${swappedPotion}`,
      default: `Pet-Dragon-${swappedPotion}`,
      noPet: `Pet-TigerCub-${swappedPotion}`,
    },
  };
  for (const egg of Object.keys(eggs.drops)) {
    substitutions.pets[`Pet-${egg}-`] = `Pet-${egg}-${swappedPotion}`;
  }
  for (const egg of Object.keys(eggs.quests)) {
    substitutions.pets[`Pet-${egg}-`] = `Pet-Dragon-${swappedPotion}`;
  }
  return substitutions;
}
