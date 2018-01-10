import assign from 'lodash/assign';
import defaults from 'lodash/defaults';
import each from 'lodash/each';
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
    mountText: t('dropEggWolfMountText'),
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
    mountText: t('dropEggFoxMountText'),
    adjective: t('dropEggFoxAdjective'),
  },
  FlyingPig: {
    text: t('dropEggFlyingPigText'),
    mountText: t('dropEggFlyingPigMountText'),
    adjective: t('dropEggFlyingPigAdjective'),
  },
  Dragon: {
    text: t('dropEggDragonText'),
    mountText: t('dropEggDragonMountText'),
    adjective: t('dropEggDragonAdjective'),
  },
  Cactus: {
    text: t('dropEggCactusText'),
    mountText: t('dropEggCactusMountText'),
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
    mountText: t('questEggGryphonMountText'),
    adjective: t('questEggGryphonAdjective'),
    canBuy: hasQuestAchievementFunction('gryphon'),
  },
  Hedgehog: {
    text: t('questEggHedgehogText'),
    mountText: t('questEggHedgehogMountText'),
    adjective: t('questEggHedgehogAdjective'),
    canBuy: hasQuestAchievementFunction('hedgehog'),
  },
  Deer: {
    text: t('questEggDeerText'),
    mountText: t('questEggDeerMountText'),
    adjective: t('questEggDeerAdjective'),
    canBuy: hasQuestAchievementFunction('ghost_stag'),
  },
  Egg: {
    text: t('questEggEggText'),
    mountText: t('questEggEggMountText'),
    adjective: t('questEggEggAdjective'),
  },
  Rat: {
    text: t('questEggRatText'),
    mountText: t('questEggRatMountText'),
    adjective: t('questEggRatAdjective'),
    canBuy: hasQuestAchievementFunction('rat'),
  },
  Octopus: {
    text: t('questEggOctopusText'),
    mountText: t('questEggOctopusMountText'),
    adjective: t('questEggOctopusAdjective'),
    canBuy: hasQuestAchievementFunction('octopus'),
  },
  Seahorse: {
    text: t('questEggSeahorseText'),
    mountText: t('questEggSeahorseMountText'),
    adjective: t('questEggSeahorseAdjective'),
    canBuy: hasQuestAchievementFunction('dilatory_derby'),
  },
  Parrot: {
    text: t('questEggParrotText'),
    mountText: t('questEggParrotMountText'),
    adjective: t('questEggParrotAdjective'),
    canBuy: hasQuestAchievementFunction('harpy'),
  },
  Rooster: {
    text: t('questEggRoosterText'),
    mountText: t('questEggRoosterMountText'),
    adjective: t('questEggRoosterAdjective'),
    canBuy: hasQuestAchievementFunction('rooster'),
  },
  Spider: {
    text: t('questEggSpiderText'),
    mountText: t('questEggSpiderMountText'),
    adjective: t('questEggSpiderAdjective'),
    canBuy: hasQuestAchievementFunction('spider'),
  },
  Owl: {
    text: t('questEggOwlText'),
    mountText: t('questEggOwlMountText'),
    adjective: t('questEggOwlAdjective'),
    canBuy: hasQuestAchievementFunction('owl'),
  },
  Penguin: {
    text: t('questEggPenguinText'),
    mountText: t('questEggPenguinMountText'),
    adjective: t('questEggPenguinAdjective'),
    canBuy: hasQuestAchievementFunction('penguin'),
  },
  TRex: {
    text: t('questEggTRexText'),
    mountText: t('questEggTRexMountText'),
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
    mountText: t('questEggRockMountText'),
    adjective: t('questEggRockAdjective'),
    canBuy: hasQuestAchievementFunction('rock'),
  },
  Bunny: {
    text: t('questEggBunnyText'),
    mountText: t('questEggBunnyMountText'),
    adjective: t('questEggBunnyAdjective'),
    canBuy: hasQuestAchievementFunction('bunny'),
  },
  Slime: {
    text: t('questEggSlimeText'),
    mountText: t('questEggSlimeMountText'),
    adjective: t('questEggSlimeAdjective'),
    canBuy: hasQuestAchievementFunction('slime'),
  },
  Sheep: {
    text: t('questEggSheepText'),
    mountText: t('questEggSheepMountText'),
    adjective: t('questEggSheepAdjective'),
    canBuy: hasQuestAchievementFunction('sheep'),
  },
  Cuttlefish: {
    text: t('questEggCuttlefishText'),
    mountText: t('questEggCuttlefishMountText'),
    adjective: t('questEggCuttlefishAdjective'),
    canBuy: hasQuestAchievementFunction('kraken'),
  },
  Whale: {
    text: t('questEggWhaleText'),
    mountText: t('questEggWhaleMountText'),
    adjective: t('questEggWhaleAdjective'),
    canBuy: hasQuestAchievementFunction('whale'),
  },
  Cheetah: {
    text: t('questEggCheetahText'),
    mountText: t('questEggCheetahMountText'),
    adjective: t('questEggCheetahAdjective'),
    canBuy: hasQuestAchievementFunction('cheetah'),
  },
  Horse: {
    text: t('questEggHorseText'),
    mountText: t('questEggHorseMountText'),
    adjective: t('questEggHorseAdjective'),
    canBuy: hasQuestAchievementFunction('horse'),
  },
  Frog: {
    text: t('questEggFrogText'),
    mountText: t('questEggFrogMountText'),
    adjective: t('questEggFrogAdjective'),
    canBuy: hasQuestAchievementFunction('frog'),
  },
  Snake: {
    text: t('questEggSnakeText'),
    mountText: t('questEggSnakeMountText'),
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
    mountText: t('questEggSabretoothMountText'),
    adjective: t('questEggSabretoothAdjective'),
    canBuy: hasQuestAchievementFunction('sabretooth'),
  },
  Monkey: {
    text: t('questEggMonkeyText'),
    mountText: t('questEggMonkeyMountText'),
    adjective: t('questEggMonkeyAdjective'),
    canBuy: hasQuestAchievementFunction('monkey'),
  },
  Snail: {
    text: t('questEggSnailText'),
    mountText: t('questEggSnailMountText'),
    adjective: t('questEggSnailAdjective'),
    canBuy: hasQuestAchievementFunction('snail'),
  },
  Falcon: {
    text: t('questEggFalconText'),
    mountText: t('questEggFalconMountText'),
    adjective: t('questEggFalconAdjective'),
    canBuy: hasQuestAchievementFunction('falcon'),
  },
  Treeling: {
    text: t('questEggTreelingText'),
    mountText: t('questEggTreelingMountText'),
    adjective: t('questEggTreelingAdjective'),
    canBuy: hasQuestAchievementFunction('treeling'),
  },
  Axolotl: {
    text: t('questEggAxolotlText'),
    mountText: t('questEggAxolotlMountText'),
    adjective: t('questEggAxolotlAdjective'),
    canBuy: hasQuestAchievementFunction('axolotl'),
  },
  Turtle: {
    text: t('questEggTurtleText'),
    mountText: t('questEggTurtleMountText'),
    adjective: t('questEggTurtleAdjective'),
    canBuy: hasQuestAchievementFunction('turtle'),
  },
  Armadillo: {
    text: t('questEggArmadilloText'),
    mountText: t('questEggArmadilloMountText'),
    adjective: t('questEggArmadilloAdjective'),
    canBuy: hasQuestAchievementFunction('armadillo'),
  },
  Cow: {
    text: t('questEggCowText'),
    mountText: t('questEggCowMountText'),
    adjective: t('questEggCowAdjective'),
    canBuy: hasQuestAchievementFunction('cow'),
  },
  Beetle: {
    text: t('questEggBeetleText'),
    mountText: t('questEggBeetleMountText'),
    adjective: t('questEggBeetleAdjective'),
    canBuy: hasQuestAchievementFunction('beetle'),
  },
  Ferret: {
    text: t('questEggFerretText'),
    mountText: t('questEggFerretMountText'),
    adjective: t('questEggFerretAdjective'),
    canBuy: hasQuestAchievementFunction('ferret'),
  },
  Sloth: {
    text: t('questEggSlothText'),
    mountText: t('questEggSlothMountText'),
    adjective: t('questEggSlothAdjective'),
    canBuy: hasQuestAchievementFunction('sloth'),
  },
  Triceratops: {
    text: t('questEggTriceratopsText'),
    mountText: t('questEggTriceratopsMountText'),
    adjective: t('questEggTriceratopsAdjective'),
    canBuy: hasQuestAchievementFunction('triceratops'),
  },
  GuineaPig: {
    text: t('questEggGuineaPigText'),
    mountText: t('questEggGuineaPigMountText'),
    adjective: t('questEggGuineaPigAdjective'),
    canBuy: hasQuestAchievementFunction('guineapig'),
  },
  Peacock: {
    text: t('questEggPeacockText'),
    mountText: t('questEggPeacockMountText'),
    adjective: t('questEggPeacockAdjective'),
    canBuy: hasQuestAchievementFunction('peacock'),
  },
  Butterfly: {
    text: t('questEggButterflyText'),
    mountText: t('questEggButterflyMountText'),
    adjective: t('questEggButterflyAdjective'),
    canBuy: hasQuestAchievementFunction('butterfly'),
  },
  Nudibranch: {
    text: t('questEggNudibranchText'),
    mountText: t('questEggNudibranchMountText'),
    adjective: t('questEggNudibranchAdjective'),
    canBuy: hasQuestAchievementFunction('nudibranch'),
  },
  Hippo: {
    text: t('questEggHippoText'),
    mountText: t('questEggHippoMountText'),
    adjective: t('questEggHippoAdjective'),
    canBuy: hasQuestAchievementFunction('hippo'),
  },
  Yarn: {
    text: t('questEggYarnText'),
    mountText: t('questEggYarnMountText'),
    adjective: t('questEggYarnAdjective'),
    canBuy: hasQuestAchievementFunction('yarn'),
  },
  Pterodactyl: {
    text: t('questEggPterodactylText'),
    mountText: t('questEggPterodactylMountText'),
    adjective: t('questEggPterodactylAdjective'),
    canBuy: hasQuestAchievementFunction('pterodactyl'),
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
