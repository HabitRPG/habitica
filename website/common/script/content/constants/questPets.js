import t from '../translation';

const QUEST_PETS = {
  alligator: {
    text: t('questAlligatorText'),
    notes: t('questAlligatorNotes'),
    completion: t('questAlligatorCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questAlligatorBoss'),
      hp: 1100,
      str: 2.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Alligator',
          text: t('questAlligatorDropAlligatorEgg'),
        }, {
          type: 'eggs',
          key: 'Alligator',
          text: t('questAlligatorDropAlligatorEgg'),
        }, {
          type: 'eggs',
          key: 'Alligator',
          text: t('questAlligatorDropAlligatorEgg'),
        },
      ],
      gp: 73,
      exp: 725,
      unlock: t('questAlligatorUnlockText'),
    },
  },
  armadillo: {
    text: t('questArmadilloText'),
    notes: t('questArmadilloNotes'),
    completion: t('questArmadilloCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questArmadilloBoss'),
      hp: 600,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Armadillo',
          text: t('questArmadilloDropArmadilloEgg'),
        }, {
          type: 'eggs',
          key: 'Armadillo',
          text: t('questArmadilloDropArmadilloEgg'),
        }, {
          type: 'eggs',
          key: 'Armadillo',
          text: t('questArmadilloDropArmadilloEgg'),
        },
      ],
      gp: 43,
      exp: 350,
      unlock: t('questArmadilloUnlockText'),
    },
  },
  axolotl: {
    text: t('questAxolotlText'),
    notes: t('questAxolotlNotes'),
    completion: t('questAxolotlCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questAxolotlBoss'),
      hp: 500,
      str: 1.5,
      rage: {
        title: t('questAxolotlRageTitle'),
        description: t('questAxolotlRageDescription'),
        value: 50,
        healing: 0.3,
        effect: t('questAxolotlRageEffect'),
      },
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Axolotl',
          text: t('questAxolotlDropAxolotlEgg'),
        }, {
          type: 'eggs',
          key: 'Axolotl',
          text: t('questAxolotlDropAxolotlEgg'),
        }, {
          type: 'eggs',
          key: 'Axolotl',
          text: t('questAxolotlDropAxolotlEgg'),
        },
      ],
      gp: 37,
      exp: 275,
      unlock: t('questAxolotlUnlockText'),
    },
  },
  badger: {
    text: t('questBadgerText'),
    notes: t('questBadgerNotes'),
    completion: t('questBadgerCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questBadgerBoss'),
      hp: 600,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Badger',
          text: t('questBadgerDropBadgerEgg'),
        }, {
          type: 'eggs',
          key: 'Badger',
          text: t('questBadgerDropBadgerEgg'),
        }, {
          type: 'eggs',
          key: 'Badger',
          text: t('questBadgerDropBadgerEgg'),
        },
      ],
      gp: 43,
      exp: 350,
      unlock: t('questBadgerUnlockText'),
    },
  },
  beetle: {
    text: t('questBeetleText'),
    notes: t('questBeetleNotes'),
    completion: t('questBeetleCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questBeetleBoss'),
      hp: 500,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Beetle',
          text: t('questBeetleDropBeetleEgg'),
        }, {
          type: 'eggs',
          key: 'Beetle',
          text: t('questBeetleDropBeetleEgg'),
        }, {
          type: 'eggs',
          key: 'Beetle',
          text: t('questBeetleDropBeetleEgg'),
        },
      ],
      gp: 37,
      exp: 275,
      unlock: t('questBeetleUnlockText'),
    },
  },
  bunny: {
    text: t('questBunnyText'),
    notes: t('questBunnyNotes'),
    completion: t('questBunnyCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questBunnyBoss'),
      hp: 300,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Bunny',
          text: t('questBunnyDropBunnyEgg'),
        }, {
          type: 'eggs',
          key: 'Bunny',
          text: t('questBunnyDropBunnyEgg'),
        }, {
          type: 'eggs',
          key: 'Bunny',
          text: t('questBunnyDropBunnyEgg'),
        },
      ],
      gp: 25,
      exp: 125,
      unlock: t('questBunnyUnlockText'),
    },
  },
  butterfly: {
    text: t('questButterflyText'),
    notes: t('questButterflyNotes'),
    completion: t('questButterflyCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questButterflyBoss'),
      hp: 400,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Butterfly',
          text: t('questButterflyDropButterflyEgg'),
        }, {
          type: 'eggs',
          key: 'Butterfly',
          text: t('questButterflyDropButterflyEgg'),
        }, {
          type: 'eggs',
          key: 'Butterfly',
          text: t('questButterflyDropButterflyEgg'),
        },
      ],
      gp: 31,
      exp: 200,
      unlock: t('questButterflyUnlockText'),
    },
  },
  cheetah: {
    text: t('questCheetahText'),
    notes: t('questCheetahNotes'),
    completion: t('questCheetahCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questCheetahBoss'),
      hp: 600,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Cheetah',
          text: t('questCheetahDropCheetahEgg'),
        }, {
          type: 'eggs',
          key: 'Cheetah',
          text: t('questCheetahDropCheetahEgg'),
        }, {
          type: 'eggs',
          key: 'Cheetah',
          text: t('questCheetahDropCheetahEgg'),
        },
      ],
      gp: 43,
      exp: 350,
      unlock: t('questCheetahUnlockText'),
    },
  },
  cow: {
    text: t('questCowText'),
    notes: t('questCowNotes'),
    completion: t('questCowCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questCowBoss'),
      hp: 400,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Cow',
          text: t('questCowDropCowEgg'),
        }, {
          type: 'eggs',
          key: 'Cow',
          text: t('questCowDropCowEgg'),
        }, {
          type: 'eggs',
          key: 'Cow',
          text: t('questCowDropCowEgg'),
        },
      ],
      gp: 31,
      exp: 200,
      unlock: t('questCowUnlockText'),
    },
  },
  dilatory_derby: { // eslint-disable-line camelcase
    text: t('questSeahorseText'),
    notes: t('questSeahorseNotes'),
    completion: t('questSeahorseCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questSeahorseBoss'),
      hp: 300,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Seahorse',
          text: t('questSeahorseDropSeahorseEgg'),
        }, {
          type: 'eggs',
          key: 'Seahorse',
          text: t('questSeahorseDropSeahorseEgg'),
        }, {
          type: 'eggs',
          key: 'Seahorse',
          text: t('questSeahorseDropSeahorseEgg'),
        },
      ],
      gp: 25,
      exp: 125,
      unlock: t('questSeahorseUnlockText'),
    },
  },
  dolphin: {
    text: t('questDolphinText'),
    notes: t('questDolphinNotes'),
    completion: t('questDolphinCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questDolphinBoss'),
      hp: 300,
      str: 1.25,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Dolphin',
          text: t('questDolphinDropDolphinEgg'),
        }, {
          type: 'eggs',
          key: 'Dolphin',
          text: t('questDolphinDropDolphinEgg'),
        }, {
          type: 'eggs',
          key: 'Dolphin',
          text: t('questDolphinDropDolphinEgg'),
        },
      ],
      gp: 22,
      exp: 110,
      unlock: t('questDolphinUnlockText'),
    },
  },
  falcon: {
    text: t('questFalconText'),
    notes: t('questFalconNotes'),
    completion: t('questFalconCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questFalconBoss'),
      hp: 700,
      str: 2,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Falcon',
          text: t('questFalconDropFalconEgg'),
        }, {
          type: 'eggs',
          key: 'Falcon',
          text: t('questFalconDropFalconEgg'),
        }, {
          type: 'eggs',
          key: 'Falcon',
          text: t('questFalconDropFalconEgg'),
        },
      ],
      gp: 49,
      exp: 425,
      unlock: t('questFalconUnlockText'),
    },
  },
  ferret: {
    text: t('questFerretText'),
    notes: t('questFerretNotes'),
    completion: t('questFerretCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questFerretBoss'),
      hp: 400,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Ferret',
          text: t('questFerretDropFerretEgg'),
        }, {
          type: 'eggs',
          key: 'Ferret',
          text: t('questFerretDropFerretEgg'),
        }, {
          type: 'eggs',
          key: 'Ferret',
          text: t('questFerretDropFerretEgg'),
        },
      ],
      gp: 31,
      exp: 200,
      unlock: t('questFerretUnlockText'),
    },
  },
  frog: {
    text: t('questFrogText'),
    notes: t('questFrogNotes'),
    completion: t('questFrogCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questFrogBoss'),
      hp: 300,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Frog',
          text: t('questFrogDropFrogEgg'),
        }, {
          type: 'eggs',
          key: 'Frog',
          text: t('questFrogDropFrogEgg'),
        }, {
          type: 'eggs',
          key: 'Frog',
          text: t('questFrogDropFrogEgg'),
        },
      ],
      gp: 25,
      exp: 125,
      unlock: t('questFrogUnlockText'),
    },
  },
  ghost_stag: { // eslint-disable-line camelcase
    text: t('questGhostStagText'),
    notes: t('questGhostStagNotes'),
    completion: t('questGhostStagCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questGhostStagBoss'),
      hp: 1200,
      str: 2.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Deer',
          text: t('questGhostStagDropDeerEgg'),
        }, {
          type: 'eggs',
          key: 'Deer',
          text: t('questGhostStagDropDeerEgg'),
        }, {
          type: 'eggs',
          key: 'Deer',
          text: t('questGhostStagDropDeerEgg'),
        },
      ],
      gp: 80,
      exp: 800,
      unlock: t('questGhostStagUnlockText'),
    },
  },
  gryphon: {
    text: t('questGryphonText'),
    notes: t('questGryphonNotes'),
    completion: t('questGryphonCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questGryphonBoss'),
      hp: 300,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Gryphon',
          text: t('questGryphonDropGryphonEgg'),
        }, {
          type: 'eggs',
          key: 'Gryphon',
          text: t('questGryphonDropGryphonEgg'),
        }, {
          type: 'eggs',
          key: 'Gryphon',
          text: t('questGryphonDropGryphonEgg'),
        },
      ],
      gp: 25,
      exp: 125,
      unlock: t('questGryphonUnlockText'),
    },
  },
  guineapig: {
    text: t('questGuineaPigText'),
    notes: t('questGuineaPigNotes'),
    completion: t('questGuineaPigCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questGuineaPigBoss'),
      hp: 400,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'GuineaPig',
          text: t('questGuineaPigDropGuineaPigEgg'),
        }, {
          type: 'eggs',
          key: 'GuineaPig',
          text: t('questGuineaPigDropGuineaPigEgg'),
        }, {
          type: 'eggs',
          key: 'GuineaPig',
          text: t('questGuineaPigDropGuineaPigEgg'),
        },
      ],
      gp: 31,
      exp: 200,
      unlock: t('questGuineaPigUnlockText'),
    },
  },
  harpy: {
    text: t('questHarpyText'),
    notes: t('questHarpyNotes'),
    completion: t('questHarpyCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questHarpyBoss'),
      hp: 600,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Parrot',
          text: t('questHarpyDropParrotEgg'),
        }, {
          type: 'eggs',
          key: 'Parrot',
          text: t('questHarpyDropParrotEgg'),
        }, {
          type: 'eggs',
          key: 'Parrot',
          text: t('questHarpyDropParrotEgg'),
        },
      ],
      gp: 43,
      exp: 350,
      unlock: t('questHarpyUnlockText'),
    },
  },
  hedgehog: {
    text: t('questHedgehogText'),
    notes: t('questHedgehogNotes'),
    completion: t('questHedgehogCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questHedgehogBoss'),
      hp: 400,
      str: 1.25,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Hedgehog',
          text: t('questHedgehogDropHedgehogEgg'),
        }, {
          type: 'eggs',
          key: 'Hedgehog',
          text: t('questHedgehogDropHedgehogEgg'),
        }, {
          type: 'eggs',
          key: 'Hedgehog',
          text: t('questHedgehogDropHedgehogEgg'),
        },
      ],
      gp: 30,
      exp: 125,
      unlock: t('questHedgehogUnlockText'),
    },
  },
  hippo: {
    text: t('questHippoText'),
    notes: t('questHippoNotes'),
    completion: t('questHippoCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questHippoBoss'),
      hp: 800,
      str: 2,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Hippo',
          text: t('questHippoDropHippoEgg'),
        }, {
          type: 'eggs',
          key: 'Hippo',
          text: t('questHippoDropHippoEgg'),
        }, {
          type: 'eggs',
          key: 'Hippo',
          text: t('questHippoDropHippoEgg'),
        },
      ],
      gp: 55,
      exp: 500,
      unlock: t('questHippoUnlockText'),
    },
  },
  horse: {
    text: t('questHorseText'),
    notes: t('questHorseNotes'),
    completion: t('questHorseCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questHorseBoss'),
      hp: 500,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Horse',
          text: t('questHorseDropHorseEgg'),
        }, {
          type: 'eggs',
          key: 'Horse',
          text: t('questHorseDropHorseEgg'),
        }, {
          type: 'eggs',
          key: 'Horse',
          text: t('questHorseDropHorseEgg'),
        },
      ],
      gp: 37,
      exp: 275,
      unlock: t('questHorseUnlockText'),
    },
  },
  kangaroo: {
    text: t('questKangarooText'),
    notes: t('questKangarooNotes'),
    completion: t('questKangarooCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questKangarooBoss'),
      hp: 700,
      str: 2,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Kangaroo',
          text: t('questKangarooDropKangarooEgg'),
        }, {
          type: 'eggs',
          key: 'Kangaroo',
          text: t('questKangarooDropKangarooEgg'),
        }, {
          type: 'eggs',
          key: 'Kangaroo',
          text: t('questKangarooDropKangarooEgg'),
        },
      ],
      gp: 49,
      exp: 425,
      unlock: t('questKangarooUnlockText'),
    },
  },
  kraken: {
    text: t('questKrakenText'),
    notes: t('questKrakenNotes'),
    completion: t('questKrakenCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questKrakenBoss'),
      hp: 800,
      str: 2,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Cuttlefish',
          text: t('questKrakenDropCuttlefishEgg'),
        }, {
          type: 'eggs',
          key: 'Cuttlefish',
          text: t('questKrakenDropCuttlefishEgg'),
        }, {
          type: 'eggs',
          key: 'Cuttlefish',
          text: t('questKrakenDropCuttlefishEgg'),
        },
      ],
      gp: 55,
      exp: 500,
      unlock: t('questKrakenUnlockText'),
    },
  },
  monkey: {
    text: t('questMonkeyText'),
    notes: t('questMonkeyNotes'),
    completion: t('questMonkeyCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questMonkeyBoss'),
      hp: 400,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Monkey',
          text: t('questMonkeyDropMonkeyEgg'),
        }, {
          type: 'eggs',
          key: 'Monkey',
          text: t('questMonkeyDropMonkeyEgg'),
        }, {
          type: 'eggs',
          key: 'Monkey',
          text: t('questMonkeyDropMonkeyEgg'),
        },
      ],
      gp: 31,
      exp: 200,
      unlock: t('questMonkeyUnlockText'),
    },
  },
  nudibranch: {
    text: t('questNudibranchText'),
    notes: t('questNudibranchNotes'),
    completion: t('questNudibranchCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questNudibranchBoss'),
      hp: 400,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Nudibranch',
          text: t('questNudibranchDropNudibranchEgg'),
        }, {
          type: 'eggs',
          key: 'Nudibranch',
          text: t('questNudibranchDropNudibranchEgg'),
        }, {
          type: 'eggs',
          key: 'Nudibranch',
          text: t('questNudibranchDropNudibranchEgg'),
        },
      ],
      gp: 31,
      exp: 200,
      unlock: t('questNudibranchUnlockText'),
    },
  },
  octopus: {
    text: t('questOctopusText'),
    notes: t('questOctopusNotes'),
    completion: t('questOctopusCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questOctopusBoss'),
      hp: 1200,
      str: 2.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Octopus',
          text: t('questOctopusDropOctopusEgg'),
        }, {
          type: 'eggs',
          key: 'Octopus',
          text: t('questOctopusDropOctopusEgg'),
        }, {
          type: 'eggs',
          key: 'Octopus',
          text: t('questOctopusDropOctopusEgg'),
        },
      ],
      gp: 80,
      exp: 800,
      unlock: t('questOctopusUnlockText'),
    },
  },
  owl: {
    text: t('questOwlText'),
    notes: t('questOwlNotes'),
    completion: t('questOwlCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questOwlBoss'),
      hp: 500,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Owl',
          text: t('questOwlDropOwlEgg'),
        }, {
          type: 'eggs',
          key: 'Owl',
          text: t('questOwlDropOwlEgg'),
        }, {
          type: 'eggs',
          key: 'Owl',
          text: t('questOwlDropOwlEgg'),
        },
      ],
      gp: 37,
      exp: 275,
      unlock: t('questOwlUnlockText'),
    },
  },
  peacock: {
    text: t('questPeacockText'),
    notes: t('questPeacockNotes'),
    completion: t('questPeacockCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questPeacockBoss'),
      hp: 300,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Peacock',
          text: t('questPeacockDropPeacockEgg'),
        }, {
          type: 'eggs',
          key: 'Peacock',
          text: t('questPeacockDropPeacockEgg'),
        }, {
          type: 'eggs',
          key: 'Peacock',
          text: t('questPeacockDropPeacockEgg'),
        },
      ],
      gp: 25,
      exp: 125,
      unlock: t('questPeacockUnlockText'),
    },
  },
  penguin: {
    text: t('questPenguinText'),
    notes: t('questPenguinNotes'),
    completion: t('questPenguinCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questPenguinBoss'),
      hp: 400,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Penguin',
          text: t('questPenguinDropPenguinEgg'),
        }, {
          type: 'eggs',
          key: 'Penguin',
          text: t('questPenguinDropPenguinEgg'),
        }, {
          type: 'eggs',
          key: 'Penguin',
          text: t('questPenguinDropPenguinEgg'),
        },
      ],
      gp: 31,
      exp: 200,
      unlock: t('questPenguinUnlockText'),
    },
  },
  pterodactyl: {
    text: t('questPterodactylText'),
    notes: t('questPterodactylNotes'),
    completion: t('questPterodactylCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questPterodactylBoss'),
      hp: 1000,
      str: 2,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Pterodactyl',
          text: t('questPterodactylDropPterodactylEgg'),
        }, {
          type: 'eggs',
          key: 'Pterodactyl',
          text: t('questPterodactylDropPterodactylEgg'),
        }, {
          type: 'eggs',
          key: 'Pterodactyl',
          text: t('questPterodactylDropPterodactylEgg'),
        },
      ],
      gp: 67,
      exp: 650,
      unlock: t('questPterodactylUnlockText'),
    },
  },
  rat: {
    text: t('questRatText'),
    notes: t('questRatNotes'),
    completion: t('questRatCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questRatBoss'),
      hp: 1200,
      str: 2.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Rat',
          text: t('questRatDropRatEgg'),
        }, {
          type: 'eggs',
          key: 'Rat',
          text: t('questRatDropRatEgg'),
        }, {
          type: 'eggs',
          key: 'Rat',
          text: t('questRatDropRatEgg'),
        },
      ],
      gp: 80,
      exp: 800,
      unlock: t('questRatUnlockText'),
    },
  },
  rock: {
    text: t('questRockText'),
    notes: t('questRockNotes'),
    completion: t('questRockCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questRockBoss'),
      hp: 400,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Rock',
          text: t('questRockDropRockEgg'),
        }, {
          type: 'eggs',
          key: 'Rock',
          text: t('questRockDropRockEgg'),
        }, {
          type: 'eggs',
          key: 'Rock',
          text: t('questRockDropRockEgg'),
        },
      ],
      gp: 31,
      exp: 200,
      unlock: t('questRockUnlockText'),
    },
  },
  rooster: {
    text: t('questRoosterText'),
    notes: t('questRoosterNotes'),
    completion: t('questRoosterCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questRoosterBoss'),
      hp: 300,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Rooster',
          text: t('questRoosterDropRoosterEgg'),
        }, {
          type: 'eggs',
          key: 'Rooster',
          text: t('questRoosterDropRoosterEgg'),
        }, {
          type: 'eggs',
          key: 'Rooster',
          text: t('questRoosterDropRoosterEgg'),
        },
      ],
      gp: 25,
      exp: 125,
      unlock: t('questRoosterUnlockText'),
    },
  },
  sabretooth: {
    text: t('questSabretoothText'),
    notes: t('questSabretoothNotes'),
    completion: t('questSabretoothCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questSabretoothBoss'),
      hp: 1000,
      str: 2,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Sabretooth',
          text: t('questSabretoothDropSabretoothEgg'),
        }, {
          type: 'eggs',
          key: 'Sabretooth',
          text: t('questSabretoothDropSabretoothEgg'),
        }, {
          type: 'eggs',
          key: 'Sabretooth',
          text: t('questSabretoothDropSabretoothEgg'),
        },
      ],
      gp: 67,
      exp: 650,
      unlock: t('questSabretoothUnlockText'),
    },
  },
  seaserpent: {
    text: t('questSeaSerpentText'),
    notes: t('questSeaSerpentNotes'),
    completion: t('questSeaSerpentCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questSeaSerpentBoss'),
      hp: 1200,
      str: 2.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'SeaSerpent',
          text: t('questSeaSerpentDropSeaSerpentEgg'),
        }, {
          type: 'eggs',
          key: 'SeaSerpent',
          text: t('questSeaSerpentDropSeaSerpentEgg'),
        }, {
          type: 'eggs',
          key: 'SeaSerpent',
          text: t('questSeaSerpentDropSeaSerpentEgg'),
        },
      ],
      gp: 80,
      exp: 800,
      unlock: t('questSeaSerpentUnlockText'),
    },
  },
  sheep: {
    text: t('questSheepText'),
    notes: t('questSheepNotes'),
    completion: t('questSheepCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questSheepBoss'),
      hp: 300,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Sheep',
          text: t('questSheepDropSheepEgg'),
        }, {
          type: 'eggs',
          key: 'Sheep',
          text: t('questSheepDropSheepEgg'),
        }, {
          type: 'eggs',
          key: 'Sheep',
          text: t('questSheepDropSheepEgg'),
        },
      ],
      gp: 25,
      exp: 125,
      unlock: t('questSheepUnlockText'),
    },
  },
  slime: {
    text: t('questSlimeText'),
    notes: t('questSlimeNotes'),
    completion: t('questSlimeCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questSlimeBoss'),
      hp: 400,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Slime',
          text: t('questSlimeDropSlimeEgg'),
        }, {
          type: 'eggs',
          key: 'Slime',
          text: t('questSlimeDropSlimeEgg'),
        }, {
          type: 'eggs',
          key: 'Slime',
          text: t('questSlimeDropSlimeEgg'),
        },
      ],
      gp: 31,
      exp: 200,
      unlock: t('questSlimeUnlockText'),
    },
  },
  sloth: {
    text: t('questSlothText'),
    notes: t('questSlothNotes'),
    completion: t('questSlothCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questSlothBoss'),
      hp: 400,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Sloth',
          text: t('questSlothDropSlothEgg'),
        }, {
          type: 'eggs',
          key: 'Sloth',
          text: t('questSlothDropSlothEgg'),
        }, {
          type: 'eggs',
          key: 'Sloth',
          text: t('questSlothDropSlothEgg'),
        },
      ],
      gp: 31,
      exp: 200,
      unlock: t('questSlothUnlockText'),
    },
  },
  snail: {
    text: t('questSnailText'),
    notes: t('questSnailNotes'),
    completion: t('questSnailCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questSnailBoss'),
      hp: 500,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Snail',
          text: t('questSnailDropSnailEgg'),
        }, {
          type: 'eggs',
          key: 'Snail',
          text: t('questSnailDropSnailEgg'),
        }, {
          type: 'eggs',
          key: 'Snail',
          text: t('questSnailDropSnailEgg'),
        },
      ],
      gp: 37,
      exp: 275,
      unlock: t('questSnailUnlockText'),
    },
  },
  snake: {
    text: t('questSnakeText'),
    notes: t('questSnakeNotes'),
    completion: t('questSnakeCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questSnakeBoss'),
      hp: 1100,
      str: 2.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Snake',
          text: t('questSnakeDropSnakeEgg'),
        }, {
          type: 'eggs',
          key: 'Snake',
          text: t('questSnakeDropSnakeEgg'),
        }, {
          type: 'eggs',
          key: 'Snake',
          text: t('questSnakeDropSnakeEgg'),
        },
      ],
      gp: 73,
      exp: 725,
      unlock: t('questSnakeUnlockText'),
    },
  },
  spider: {
    text: t('questSpiderText'),
    notes: t('questSpiderNotes'),
    completion: t('questSpiderCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questSpiderBoss'),
      hp: 400,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Spider',
          text: t('questSpiderDropSpiderEgg'),
        }, {
          type: 'eggs',
          key: 'Spider',
          text: t('questSpiderDropSpiderEgg'),
        }, {
          type: 'eggs',
          key: 'Spider',
          text: t('questSpiderDropSpiderEgg'),
        },
      ],
      gp: 31,
      exp: 200,
      unlock: t('questSpiderUnlockText'),
    },
  },
  squirrel: {
    text: t('questSquirrelText'),
    notes: t('questSquirrelNotes'),
    completion: t('questSquirrelCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questSquirrelBoss'),
      hp: 700,
      str: 2,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Squirrel',
          text: t('questSquirrelDropSquirrelEgg'),
        }, {
          type: 'eggs',
          key: 'Squirrel',
          text: t('questSquirrelDropSquirrelEgg'),
        }, {
          type: 'eggs',
          key: 'Squirrel',
          text: t('questSquirrelDropSquirrelEgg'),
        },
      ],
      gp: 49,
      exp: 425,
      unlock: t('questSquirrelUnlockText'),
    },
  },
  treeling: {
    text: t('questTreelingText'),
    notes: t('questTreelingNotes'),
    completion: t('questTreelingCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questTreelingBoss'),
      hp: 600,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Treeling',
          text: t('questTreelingDropTreelingEgg'),
        }, {
          type: 'eggs',
          key: 'Treeling',
          text: t('questTreelingDropTreelingEgg'),
        }, {
          type: 'eggs',
          key: 'Treeling',
          text: t('questTreelingDropTreelingEgg'),
        },
      ],
      gp: 43,
      exp: 350,
      unlock: t('questTreelingUnlockText'),
    },
  },
  trex: {
    text: t('questTRexText'),
    notes: t('questTRexNotes'),
    completion: t('questTRexCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questTRexBoss'),
      hp: 800,
      str: 2,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg'),
        }, {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg'),
        }, {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg'),
        },
      ],
      gp: 55,
      exp: 500,
      unlock: t('questTRexUnlockText'),
    },
  },
  trex_undead: { // eslint-disable-line camelcase
    text: t('questTRexUndeadText'),
    notes: t('questTRexUndeadNotes'),
    completion: t('questTRexUndeadCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questTRexUndeadBoss'),
      hp: 500,
      str: 2,
      rage: {
        title: t('questTRexUndeadRageTitle'),
        description: t('questTRexUndeadRageDescription'),
        value: 50,
        healing: 0.3,
        effect: t('questTRexUndeadRageEffect'),
      },
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg'),
        }, {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg'),
        }, {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg'),
        },
      ],
      gp: 55,
      exp: 500,
      unlock: t('questTRexUnlockText'),
    },
  },
  triceratops: {
    text: t('questTriceratopsText'),
    notes: t('questTriceratopsNotes'),
    completion: t('questTriceratopsCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questTriceratopsBoss'),
      hp: 1200,
      str: 2.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Triceratops',
          text: t('questTriceratopsDropTriceratopsEgg'),
        }, {
          type: 'eggs',
          key: 'Triceratops',
          text: t('questTriceratopsDropTriceratopsEgg'),
        }, {
          type: 'eggs',
          key: 'Triceratops',
          text: t('questTriceratopsDropTriceratopsEgg'),
        },
      ],
      gp: 80,
      exp: 800,
      unlock: t('questTriceratopsUnlockText'),
    },
  },
  turtle: {
    text: t('questTurtleText'),
    notes: t('questTurtleNotes'),
    completion: t('questTurtleCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questTurtleBoss'),
      hp: 300,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Turtle',
          text: t('questTurtleDropTurtleEgg'),
        }, {
          type: 'eggs',
          key: 'Turtle',
          text: t('questTurtleDropTurtleEgg'),
        }, {
          type: 'eggs',
          key: 'Turtle',
          text: t('questTurtleDropTurtleEgg'),
        },
      ],
      gp: 25,
      exp: 125,
      unlock: t('questTurtleUnlockText'),
    },
  },
  unicorn: {
    text: t('questUnicornText'),
    notes: t('questUnicornNotes'),
    completion: t('questUnicornCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questUnicornBoss'),
      hp: 600,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Unicorn',
          text: t('questUnicornDropUnicornEgg'),
        }, {
          type: 'eggs',
          key: 'Unicorn',
          text: t('questUnicornDropUnicornEgg'),
        }, {
          type: 'eggs',
          key: 'Unicorn',
          text: t('questUnicornDropUnicornEgg'),
        },
      ],
      gp: 43,
      exp: 350,
      unlock: t('questUnicornUnlockText'),
    },
  },
  velociraptor: {
    text: t('questVelociraptorText'),
    notes: t('questVelociraptorNotes'),
    completion: t('questVelociraptorCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questVelociraptorBoss'),
      hp: 900,
      str: 2,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Velociraptor',
          text: t('questVelociraptorDropVelociraptorEgg'),
        }, {
          type: 'eggs',
          key: 'Velociraptor',
          text: t('questVelociraptorDropVelociraptorEgg'),
        }, {
          type: 'eggs',
          key: 'Velociraptor',
          text: t('questVelociraptorDropVelociraptorEgg'),
        },
      ],
      gp: 63,
      exp: 575,
      unlock: t('questVelociraptorUnlockText'),
    },
  },
  whale: {
    text: t('questWhaleText'),
    notes: t('questWhaleNotes'),
    completion: t('questWhaleCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questWhaleBoss'),
      hp: 500,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Whale',
          text: t('questWhaleDropWhaleEgg'),
        }, {
          type: 'eggs',
          key: 'Whale',
          text: t('questWhaleDropWhaleEgg'),
        }, {
          type: 'eggs',
          key: 'Whale',
          text: t('questWhaleDropWhaleEgg'),
        },
      ],
      gp: 37,
      exp: 275,
      unlock: t('questWhaleUnlockText'),
    },
  },
  yarn: {
    text: t('questYarnText'),
    notes: t('questYarnNotes'),
    completion: t('questYarnCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questYarnBoss'),
      hp: 500,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Yarn',
          text: t('questYarnDropYarnEgg'),
        }, {
          type: 'eggs',
          key: 'Yarn',
          text: t('questYarnDropYarnEgg'),
        }, {
          type: 'eggs',
          key: 'Yarn',
          text: t('questYarnDropYarnEgg'),
        },
      ],
      gp: 37,
      exp: 275,
      unlock: t('questYarnUnlockText'),
    },
  },
};

export default QUEST_PETS;
