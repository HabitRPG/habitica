export default function createAnimal (egg, potion, type, content, userItems) {
  let animalKey = `${egg.key}-${potion.key}`;

  return {
    key: animalKey,
    class: type === 'pet' ? `Pet Pet-${animalKey}` : `Mount_Icon_${animalKey}`,
    eggKey: egg.key,
    eggName: egg.text(),
    potionKey: potion.key,
    potionName: potion.text(),
    name: content[`${type}Info`][animalKey].text(),
    isOwned () {
      return userItems[`${type}s`][animalKey] > 0;
    },
    mountOwned () {
      return userItems.mounts[this.key] > 0;
    },
    isAllowedToFeed () {
      return type === 'pet' && this.isOwned() && !this.mountOwned();
    },
    isHatchable () {
      return userItems.eggs[egg.key] > 0 && userItems.hatchingPotions[potion.key] > 0;
    },
  };
}
