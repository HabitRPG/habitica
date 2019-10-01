import each from 'lodash/each';
import filter from 'lodash/filter';
import keys from 'lodash/keys';
import size from 'lodash/size';
import content from './content/index';

const DROP_ANIMALS = keys(content.pets);

export function beastMasterProgress (pets = {}) {
  let count = 0;

  each(DROP_ANIMALS, (animal) => {
    if (pets[animal] > 0 || pets[animal] === -1)
      count++;
  });

  return count;
}

export function beastCount (pets = {}) {
  let count = 0;

  each(DROP_ANIMALS, (animal) => {
    if (pets[animal] > 0) count++;
  });

  return count;
}

export function dropPetsCurrentlyOwned (pets = {}) {
  let count = 0;

  each(DROP_ANIMALS, (animal) => {
    if (pets[animal] > 0)
      count++;
  });

  return count;
}

export function mountMasterProgress (mounts = {}) {
  let count = 0;

  each(DROP_ANIMALS, (animal) => {
    if (mounts[animal])
      count++;
  });

  return count;
}

export function remainingGearInSet (userGear = {}, set) {
  let gear = filter(content.gear.flat, (item) => {
    let setMatches = item.klass === set;
    let hasItem = userGear[item.key];

    return setMatches && !hasItem;
  });

  let count = size(gear);

  return count;
}

export function questsOfCategory (userQuests = {}, category) {
  let quests = filter(content.quests, (quest) => {
    let categoryMatches = quest.category === category;
    let hasQuest = userQuests[quest.key];

    return categoryMatches && hasQuest;
  });

  let count = size(quests);

  return count;
}