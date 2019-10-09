import each from 'lodash/each';
import filter from 'lodash/filter';
import keys from 'lodash/keys';
import size from 'lodash/size';
import content from './content/index';

const DROP_ANIMALS = keys(content.pets);

export function beastMasterProgress (pets = {}) {
  let count = 0;

  each(DROP_ANIMALS, animal => {
    if (pets[animal] > 0 || pets[animal] === -1) count += 1;
  });

  return count;
}

export function beastCount (pets = {}) {
  let count = 0;

  each(DROP_ANIMALS, animal => {
    if (pets[animal] > 0) count += 1;
  });

  return count;
}

export function dropPetsCurrentlyOwned (pets = {}) {
  let count = 0;

  each(DROP_ANIMALS, animal => {
    if (pets[animal] > 0) count += 1;
  });

  return count;
}

export function mountMasterProgress (mounts = {}) {
  let count = 0;

  each(DROP_ANIMALS, animal => {
    if (mounts[animal]) count += 1;
  });

  return count;
}

export function remainingGearInSet (userGear = {}, set) {
  const gear = filter(content.gear.flat, item => {
    const setMatches = item.klass === set;
    const hasItem = userGear[item.key];

    return setMatches && !hasItem;
  });

  const count = size(gear);

  return count;
}

export function questsOfCategory (userQuests = {}, category) {
  const quests = filter(content.quests, quest => {
    const categoryMatches = quest.category === category;
    const hasQuest = userQuests[quest.key];

    return categoryMatches && hasQuest;
  });

  const count = size(quests);

  return count;
}
