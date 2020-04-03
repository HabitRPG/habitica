import content from '@/../../common/script/content';

const specialPets = Object.keys(content.specialPets);
const wackyPets = Object.keys(content.wackyPets);

function getText (textOrFunction) {
  if (textOrFunction instanceof Function) {
    return textOrFunction();
  }
  return textOrFunction;
}

export function isOwned (type, animal, userItems) {
  return userItems[`${type}s`][animal.key] > 0;
}

export function isHatchable (animal, userItems) {
  return !isOwned('pet', animal, userItems)
    && userItems.eggs[animal.eggKey]
    && userItems.hatchingPotions[animal.potionKey];
}

export function isAllowedToFeed (animal, userItems) {
  return !specialPets.includes(animal.key)
    && !wackyPets.includes(animal.key)
    && isOwned('pet', animal, userItems)
    && !isOwned('mount', animal, userItems);
}

export function isSpecial (animal) {
  return specialPets.includes(animal.key);
}

export function createAnimal (egg, potion, type, _content, userItems) {
  const animalKey = `${egg.key}-${potion.key}`;

  return {
    key: animalKey,
    class: type === 'pet' ? `Pet Pet-${animalKey}` : `Mount_Icon_${animalKey}`,
    eggKey: egg.key,
    eggName: getText(egg.text),
    potionKey: potion.key,
    potionName: getText(potion.text),
    name: _content[`${type}Info`][animalKey].text(),
    isOwned () {
      return isOwned(type, this, userItems);
    },
    mountOwned () {
      return isOwned('mount', this, userItems);
    },
    isAllowedToFeed () {
      return isAllowedToFeed(this, userItems);
    },
    isHatchable () {
      return isHatchable(this, userItems);
    },
    isSpecial () {
      return isSpecial(this);
    },
  };
}
