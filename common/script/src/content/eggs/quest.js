import {generateEggs} from '../helpers';

const QUEST_EGGS = [
  'Gryphon',
  'Hedgehog',
  'Deer',
  'Egg',
  'Rat',
  'Octopus',
  'Seahorse',
  'Parrot',
  'Rooster',
  'Spider',
  'Owl',
  'Penguin',
  'TRex',
  'Rock',
  'Bunny',
  'Slime',
  'Sheep',
  'Cuttlefish',
  'Whale',
  'Cheetah',
  'Horse',
];

let eggDefaults = {
  type: 'quest',
  canBuy: (key) => {
    return _generateQuestAchievementRequirement(key);
  },
};

let eggs = generateEggs(QUEST_EGGS, eggDefaults);

// Exceptions to normal defaults
eggs.TRex.canBuy = (user) => {
  let achievements = user.achievements.quests;

  if (achievements) {
    return achievements.trex > 0 ||
      achievements.trex_undead > 0;
  }
}

eggs.Deer.canBuy = _generateQuestAchievementRequirement('ghost_stag');
eggs.Seahorse.canBuy = _generateQuestAchievementRequirement('dilatory_derby');
eggs.Parrot.canBuy = _generateQuestAchievementRequirement('harpy');
eggs.Cuttlefish.canBuy = _generateQuestAchievementRequirement('kraken');

eggs.Egg.canBuy = () => { return false; }

function _generateQuestAchievementRequirement(name) {
  return (user) => {
    let achievements = user.achievements.quests;
    let questKey = name.toLowerCase();

    if (achievements) {
      return achievements[questKey] > 0;
    }
  };
}

export default eggs;
