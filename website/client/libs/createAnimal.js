
function getText (textOrFunction) {
  if (textOrFunction instanceof Function) {
    return textOrFunction();
  } else {
    return textOrFunction;
  }
}

export function isOwned (type, animal, userItems) {
  return userItems[`${type}s`][animal.key] > 0;
}

export function isHatchable (animal, userItems) {
  return !isOwned('pet', animal, userItems) &&
    userItems.eggs[animal.eggKey] &&
    userItems.hatchingPotions[animal.potionKey];
}

export function isAllowedToFeed (animal, userItems) {
  return isOwned('pet', animal, userItems) && !isOwned('mount', animal, userItems);
}

export function createAnimal (egg, potion, type, content, userItems) {
  let animalKey = `${egg.key}-${potion.key}`;

  return {
    key: animalKey,
    class: type === 'pet' ? `Pet Pet-${animalKey}` : `Mount_Icon_${animalKey}`,
    eggKey: egg.key,
    eggName: getText(egg.text),
    potionKey: potion.key,
    potionName: getText(potion.text),
    name: content[`${type}Info`][animalKey].text(),
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
  };
}
