import _ from 'lodash';
import content from './content/index';

const DROP_ANIMALS = _.keys(content.pets);

function beastMasterProgress (pets) {
  let count = 0;

  _(DROP_ANIMALS).each((animal) => {
    if (pets[animal] > 0 || pets[animal] === -1)
      count++;
  });

  return count;
}

function dropPetsCurrentlyOwned (pets) {
  let count = 0;

  _(DROP_ANIMALS).each((animal) => {
    if (pets[animal] > 0)
      count++;
  });

  return count;
}

function mountMasterProgress (mounts) {
  let count = 0;

  _(DROP_ANIMALS).each((animal) => {
    if (mounts[animal])
      count++;
  });

  return count;
}

function remainingGearInSet (userGear, set) {
  let gear = _.filter(content.gear.flat, (item) => {
    let setMatches = item.klass === set;
    let hasItem = userGear[item.key];

    return setMatches && !hasItem;
  });

  let count = _.size(gear);

  return count;
}

function questsOfCategory (userQuests, category) {
  let quests = _.filter(content.quests, (quest) => {
    let categoryMatches = quest.category === category;
    let hasQuest = userQuests[quest.key];

    return categoryMatches && hasQuest;
  });

  let count = _.size(quests);

  return count;
}

export default {
  beastMasterProgress,
  dropPetsCurrentlyOwned,
  mountMasterProgress,
  remainingGearInSet,
  questsOfCategory,
};
