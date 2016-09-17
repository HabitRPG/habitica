import {
  assign,
  defaults,
  each,
} from  'lodash';
import t from './translation';

function applyEggDefaults (set, config) {
  each(set, (egg, key) => {
    defaults(egg, {
      canBuy: config.canBuy,
      value: 3,
      key,
      notes: t('eggNotes', {
        eggText: egg.text,
        eggAdjective: egg.adjective,
      }),
      mountText: egg.text,
    });
  });
}

function hasQuestAchievementFunction (key) {
  return (user) => {
    return user.achievements.quests &&
      user.achievements.quests[key] > 0;
  };
}

let drops = {
  Wolf: {
    text: t('dropEggWolfText'),
    adjective: t('dropEggWolfAdjective'),
  },
  TigerCub: {
    text: t('dropEggTigerCubText'),
    mountText: t('dropEggTigerCubMountText'),
    adjective: t('dropEggTigerCubAdjective'),
  },
  PandaCub: {
    text: t('dropEggPandaCubText'),
    mountText: t('dropEggPandaCubMountText'),
    adjective: t('dropEggPandaCubAdjective'),
  },
  LionCub: {
    text: t('dropEggLionCubText'),
    mountText: t('dropEggLionCubMountText'),
    adjective: t('dropEggLionCubAdjective'),
  },
  Fox: {
    text: t('dropEggFoxText'),
    adjective: t('dropEggFoxAdjective'),
  },
  FlyingPig: {
    text: t('dropEggFlyingPigText'),
    adjective: t('dropEggFlyingPigAdjective'),
  },
  Dragon: {
    text: t('dropEggDragonText'),
    adjective: t('dropEggDragonAdjective'),
  },
  Cactus: {
    text: t('dropEggCactusText'),
    adjective: t('dropEggCactusAdjective'),
  },
  BearCub: {
    text: t('dropEggBearCubText'),
    mountText: t('dropEggBearCubMountText'),
    adjective: t('dropEggBearCubAdjective'),
  },
};

let quests = {
  Gryphon: {
    text: t('questEggGryphonText'),
    adjective: t('questEggGryphonAdjective'),
    canBuy: hasQuestAchievementFunction('gryphon'),
  },
  Hedgehog: {
    text: t('questEggHedgehogText'),
    adjective: t('questEggHedgehogAdjective'),
    canBuy: hasQuestAchievementFunction('hedgehog'),
  },
  Deer: {
    text: t('questEggDeerText'),
    adjective: t('questEggDeerAdjective'),
    canBuy: hasQuestAchievementFunction('ghost_stag'),
  },
  Egg: {
    text: t('questEggEggText'),
    adjective: t('questEggEggAdjective'),
    mountText: t('questEggEggMountText'),
  },
  Rat: {
    text: t('questEggRatText'),
    adjective: t('questEggRatAdjective'),
    canBuy: hasQuestAchievementFunction('rat'),
  },
  Octopus: {
    text: t('questEggOctopusText'),
    adjective: t('questEggOctopusAdjective'),
    canBuy: hasQuestAchievementFunction('octopus'),
  },
  Seahorse: {
    text: t('questEggSeahorseText'),
    adjective: t('questEggSeahorseAdjective'),
    canBuy: hasQuestAchievementFunction('dilatory_derby'),
  },
  Parrot: {
    text: t('questEggParrotText'),
    adjective: t('questEggParrotAdjective'),
    canBuy: hasQuestAchievementFunction('harpy'),
  },
  Rooster: {
    text: t('questEggRoosterText'),
    adjective: t('questEggRoosterAdjective'),
    canBuy: hasQuestAchievementFunction('rooster'),
  },
  Spider: {
    text: t('questEggSpiderText'),
    adjective: t('questEggSpiderAdjective'),
    canBuy: hasQuestAchievementFunction('spider'),
  },
  Owl: {
    text: t('questEggOwlText'),
    adjective: t('questEggOwlAdjective'),
    canBuy: hasQuestAchievementFunction('owl'),
  },
  Penguin: {
    text: t('questEggPenguinText'),
    adjective: t('questEggPenguinAdjective'),
    canBuy: hasQuestAchievementFunction('penguin'),
  },
  TRex: {
    text: t('questEggTRexText'),
    adjective: t('questEggTRexAdjective'),
    canBuy (user) {
      let questAchievements = user.achievements.quests;

      return questAchievements && (
        questAchievements.trex > 0 ||
        questAchievements.trex_undead > 0
      );
    },
  },
  Rock: {
    text: t('questEggRockText'),
    adjective: t('questEggRockAdjective'),
    canBuy: hasQuestAchievementFunction('rock'),
  },
  Bunny: {
    text: t('questEggBunnyText'),
    adjective: t('questEggBunnyAdjective'),
    canBuy: hasQuestAchievementFunction('bunny'),
  },
  Slime: {
    text: t('questEggSlimeText'),
    adjective: t('questEggSlimeAdjective'),
    canBuy: hasQuestAchievementFunction('slime'),
  },
  Sheep: {
    text: t('questEggSheepText'),
    adjective: t('questEggSheepAdjective'),
    canBuy: hasQuestAchievementFunction('sheep'),
  },
  Cuttlefish: {
    text: t('questEggCuttlefishText'),
    adjective: t('questEggCuttlefishAdjective'),
    canBuy: hasQuestAchievementFunction('kraken'),
  },
  Whale: {
    text: t('questEggWhaleText'),
    adjective: t('questEggWhaleAdjective'),
    canBuy: hasQuestAchievementFunction('whale'),
  },
  Cheetah: {
    text: t('questEggCheetahText'),
    adjective: t('questEggCheetahAdjective'),
    canBuy: hasQuestAchievementFunction('cheetah'),
  },
  Horse: {
    text: t('questEggHorseText'),
    adjective: t('questEggHorseAdjective'),
    canBuy: hasQuestAchievementFunction('horse'),
  },
  Frog: {
    text: t('questEggFrogText'),
    adjective: t('questEggFrogAdjective'),
    canBuy: hasQuestAchievementFunction('frog'),
  },
  Snake: {
    text: t('questEggSnakeText'),
    adjective: t('questEggSnakeAdjective'),
    canBuy: hasQuestAchievementFunction('snake'),
  },
  Unicorn: {
    text: t('questEggUnicornText'),
    mountText: t('questEggUnicornMountText'),
    adjective: t('questEggUnicornAdjective'),
    canBuy: hasQuestAchievementFunction('unicorn'),
  },
  Sabretooth: {
    text: t('questEggSabretoothText'),
    adjective: t('questEggSabretoothAdjective'),
    canBuy: hasQuestAchievementFunction('sabretooth'),
  },
  Monkey: {
    text: t('questEggMonkeyText'),
    adjective: t('questEggMonkeyAdjective'),
    canBuy: hasQuestAchievementFunction('monkey'),
  },
  Snail: {
    text: t('questEggSnailText'),
    adjective: t('questEggSnailAdjective'),
    canBuy: hasQuestAchievementFunction('snail'),
  },
  Falcon: {
    text: t('questEggFalconText'),
    adjective: t('questEggFalconAdjective'),
    canBuy: hasQuestAchievementFunction('falcon'),
  },
  Treeling: {
    text: t('questEggTreelingText'),
    adjective: t('questEggTreelingAdjective'),
    canBuy: hasQuestAchievementFunction('treeling'),
  },
  Axolotl: {
    text: t('questEggAxolotlText'),
    adjective: t('questEggAxolotlAdjective'),
    canBuy: hasQuestAchievementFunction('axolotl'),
  },
  Turtle: {
    text: t('questEggTurtleText'),
    adjective: t('questEggTurtleAdjective'),
    canBuy: hasQuestAchievementFunction('turtle'),
  },
  Armadillo: {
    text: t('questEggArmadilloText'),
    adjective: t('questEggArmadilloAdjective'),
    canBuy: hasQuestAchievementFunction('armadillo'),
  },
  Cow: {
    text: t('questEggCowText'),
    adjective: t('questEggCowAdjective'),
    canBuy: hasQuestAchievementFunction('cow'),
  },
};

applyEggDefaults(drops, {
  canBuy () {
    return true;
  },
});

applyEggDefaults(quests, {
  canBuy () {
    return false;
  },
});

let all = assign({}, drops, quests);

module.exports = {
  drops,
  quests,
  all,
};
