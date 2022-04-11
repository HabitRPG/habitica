import t from '../translation';

const QUEST_MASTERCLASSER = {
  dilatoryDistress1: {
    text: t('questDilatoryDistress1Text'),
    notes: t('questDilatoryDistress1Notes'),
    group: 'questGroupDilatoryDistress',
    completion: t('questDilatoryDistress1Completion'),
    value: 4,
    goldValue: 200,
    category: 'gold',
    collect: {
      fireCoral: {
        text: t('questDilatoryDistress1CollectFireCoral'),
        count: 20,
      },
      blueFins: {
        text: t('questDilatoryDistress1CollectBlueFins'),
        count: 20,
      },
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: 'armor_special_finnedOceanicArmor',
          text: t('questDilatoryDistress1DropArmor'),
        },
      ],
      gp: 0,
      exp: 75,
    },
  },
  dilatoryDistress2: {
    text: t('questDilatoryDistress2Text'),
    notes: t('questDilatoryDistress2Notes'),
    group: 'questGroupDilatoryDistress',
    completion: t('questDilatoryDistress2Completion'),
    previous: 'dilatoryDistress1',
    prereqQuests: [
      'dilatoryDistress1',
    ],
    value: 4,
    goldValue: 300,
    category: 'gold',
    boss: {
      name: t('questDilatoryDistress2Boss'),
      hp: 500,
      rage: {
        title: t('questDilatoryDistress2RageTitle'),
        description: t('questDilatoryDistress2RageDescription'),
        value: 50,
        healing: 0.3,
        effect: t('questDilatoryDistress2RageEffect'),
      },
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Skeleton',
          text: t('questDilatoryDistress2DropSkeletonPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'CottonCandyBlue',
          text: t('questDilatoryDistress2DropCottonCandyBluePotion'),
        }, {
          type: 'gear',
          key: 'head_special_fireCoralCirclet',
          text: t('questDilatoryDistress2DropHeadgear'),
        },
      ],
      gp: 0,
      exp: 500,
    },
  },
  dilatoryDistress3: {
    text: t('questDilatoryDistress3Text'),
    notes: t('questDilatoryDistress3Notes'),
    group: 'questGroupDilatoryDistress',
    completion: t('questDilatoryDistress3Completion'),
    previous: 'dilatoryDistress2',
    prereqQuests: [
      'dilatoryDistress1',
      'dilatoryDistress2',
    ],
    value: 4,
    goldValue: 400,
    category: 'gold',
    boss: {
      name: t('questDilatoryDistress3Boss'),
      hp: 1000,
      str: 2,
    },
    drop: {
      items: [
        {
          type: 'food',
          key: 'Fish',
          text: t('questDilatoryDistress3DropFish'),
        }, {
          type: 'food',
          key: 'Fish',
          text: t('questDilatoryDistress3DropFish'),
        }, {
          type: 'food',
          key: 'Fish',
          text: t('questDilatoryDistress3DropFish'),
        }, {
          type: 'gear',
          key: 'weapon_special_tridentOfCrashingTides',
          text: t('questDilatoryDistress3DropWeapon'),
        }, {
          type: 'gear',
          key: 'shield_special_moonpearlShield',
          text: t('questDilatoryDistress3DropShield'),
        },
      ],
      gp: 0,
      exp: 650,
    },
  },
  mayhemMistiflying1: {
    text: t('questMayhemMistiflying1Text'),
    notes: t('questMayhemMistiflying1Notes'),
    group: 'questGroupMayhemMistiflying',
    completion: t('questMayhemMistiflying1Completion'),
    value: 4,
    goldValue: 200,
    category: 'gold',
    boss: {
      name: t('questMayhemMistiflying1Boss'),
      hp: 500,
      rage: {
        title: t('questMayhemMistiflying1RageTitle'),
        description: t('questMayhemMistiflying1RageDescription'),
        value: 50,
        healing: 0.3,
        effect: t('questMayhemMistiflying1RageEffect'),
      },
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Skeleton',
          text: t('questMayhemMistiflying1DropSkeletonPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'White',
          text: t('questMayhemMistiflying1DropWhitePotion'),
        }, {
          type: 'gear',
          key: 'armor_special_roguishRainbowMessengerRobes',
          text: t('questMayhemMistiflying1DropArmor'),
        },
      ],
      gp: 0,
      exp: 500,
    },
  },
  mayhemMistiflying2: {
    text: t('questMayhemMistiflying2Text'),
    notes: t('questMayhemMistiflying2Notes'),
    group: 'questGroupMayhemMistiflying',
    completion: t('questMayhemMistiflying2Completion'),
    previous: 'mayhemMistiflying1',
    prereqQuests: [
      'mayhemMistiflying1',
    ],
    value: 4,
    goldValue: 300,
    category: 'gold',
    collect: {
      mistifly1: {
        text: t('questMayhemMistiflying2CollectRedMistiflies'),
        count: 25,
      },
      mistifly2: {
        text: t('questMayhemMistiflying2CollectBlueMistiflies'),
        count: 15,
      },
      mistifly3: {
        text: t('questMayhemMistiflying2CollectGreenMistiflies'),
        count: 10,
      },
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: 'head_special_roguishRainbowMessengerHood',
          text: t('questMayhemMistiflying2DropHeadgear'),
        },
      ],
      gp: 0,
      exp: 75,
    },
  },
  mayhemMistiflying3: {
    text: t('questMayhemMistiflying3Text'),
    notes: t('questMayhemMistiflying3Notes'),
    group: 'questGroupMayhemMistiflying',
    completion: t('questMayhemMistiflying3Completion'),
    previous: 'mayhemMistiflying2',
    prereqQuests: [
      'mayhemMistiflying1',
      'mayhemMistiflying2',
    ],
    value: 4,
    goldValue: 400,
    category: 'gold',
    boss: {
      name: t('questMayhemMistiflying3Boss'),
      hp: 1000,
      str: 2,
    },
    drop: {
      items: [
        {
          type: 'food',
          key: 'CottonCandyPink',
          text: t('questMayhemMistiflying3DropPinkCottonCandy'),
        }, {
          type: 'food',
          key: 'CottonCandyPink',
          text: t('questMayhemMistiflying3DropPinkCottonCandy'),
        }, {
          type: 'food',
          key: 'CottonCandyPink',
          text: t('questMayhemMistiflying3DropPinkCottonCandy'),
        }, {
          type: 'gear',
          key: 'weapon_special_roguishRainbowMessage',
          text: t('questMayhemMistiflying3DropWeapon'),
        }, {
          type: 'gear',
          key: 'shield_special_roguishRainbowMessage',
          text: t('questMayhemMistiflying3DropShield'),
        },
      ],
      gp: 0,
      exp: 650,
    },
  },
  stoikalmCalamity1: {
    text: t('questStoikalmCalamity1Text'),
    notes: t('questStoikalmCalamity1Notes'),
    group: 'questGroupStoikalmCalamity',
    completion: t('questStoikalmCalamity1Completion'),
    value: 4,
    goldValue: 200,
    category: 'gold',
    boss: {
      name: t('questStoikalmCalamity1Boss'),
      hp: 500,
      rage: {
        title: t('questStoikalmCalamity1RageTitle'),
        description: t('questStoikalmCalamity1RageDescription'),
        value: 50,
        healing: 0.3,
        effect: t('questStoikalmCalamity1RageEffect'),
      },
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Skeleton',
          text: t('questStoikalmCalamity1DropSkeletonPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Desert',
          text: t('questStoikalmCalamity1DropDesertPotion'),
        }, {
          type: 'gear',
          key: 'armor_special_mammothRiderArmor',
          text: t('questStoikalmCalamity1DropArmor'),
        },
      ],
      gp: 0,
      exp: 500,
    },
  },
  stoikalmCalamity2: {
    text: t('questStoikalmCalamity2Text'),
    notes: t('questStoikalmCalamity2Notes'),
    group: 'questGroupStoikalmCalamity',
    completion: t('questStoikalmCalamity2Completion'),
    previous: 'stoikalmCalamity1',
    prereqQuests: [
      'stoikalmCalamity1',
    ],
    value: 4,
    goldValue: 300,
    category: 'gold',
    collect: {
      icicleCoin: {
        text: t('questStoikalmCalamity2CollectIcicleCoins'),
        count: 40,
      },
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: 'head_special_mammothRiderHelm',
          text: t('questStoikalmCalamity2DropHeadgear'),
        },
      ],
      gp: 0,
      exp: 75,
    },
  },
  stoikalmCalamity3: {
    text: t('questStoikalmCalamity3Text'),
    notes: t('questStoikalmCalamity3Notes'),
    group: 'questGroupStoikalmCalamity',
    completion: t('questStoikalmCalamity3Completion'),
    previous: 'stoikalmCalamity2',
    prereqQuests: [
      'stoikalmCalamity1',
      'stoikalmCalamity2',
    ],
    value: 4,
    goldValue: 400,
    category: 'gold',
    boss: {
      name: t('questStoikalmCalamity3Boss'),
      hp: 1000,
      str: 2,
    },
    drop: {
      items: [
        {
          type: 'food',
          key: 'CottonCandyBlue',
          text: t('questStoikalmCalamity3DropBlueCottonCandy'),
        }, {
          type: 'food',
          key: 'CottonCandyBlue',
          text: t('questStoikalmCalamity3DropBlueCottonCandy'),
        }, {
          type: 'food',
          key: 'CottonCandyBlue',
          text: t('questStoikalmCalamity3DropBlueCottonCandy'),
        }, {
          type: 'gear',
          key: 'weapon_special_mammothRiderSpear',
          text: t('questStoikalmCalamity3DropWeapon'),
        }, {
          type: 'gear',
          key: 'shield_special_mammothRiderHorn',
          text: t('questStoikalmCalamity3DropShield'),
        },
      ],
      gp: 0,
      exp: 650,
    },
  },
  taskwoodsTerror1: {
    text: t('questTaskwoodsTerror1Text'),
    notes: t('questTaskwoodsTerror1Notes'),
    group: 'questGroupTaskwoodsTerror',
    completion: t('questTaskwoodsTerror1Completion'),
    value: 4,
    goldValue: 200,
    category: 'gold',
    boss: {
      name: t('questTaskwoodsTerror1Boss'),
      hp: 500,
      rage: {
        title: t('questTaskwoodsTerror1RageTitle'),
        description: t('questTaskwoodsTerror1RageDescription'),
        value: 50,
        healing: 0.3,
        effect: t('questTaskwoodsTerror1RageEffect'),
      },
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Skeleton',
          text: t('questTaskwoodsTerror1DropSkeletonPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Red',
          text: t('questTaskwoodsTerror1DropRedPotion'),
        }, {
          type: 'gear',
          key: 'head_special_pyromancersTurban',
          text: t('questTaskwoodsTerror1DropHeadgear'),
        },
      ],
      gp: 0,
      exp: 500,
    },
  },
  taskwoodsTerror2: {
    text: t('questTaskwoodsTerror2Text'),
    notes: t('questTaskwoodsTerror2Notes'),
    group: 'questGroupTaskwoodsTerror',
    completion: t('questTaskwoodsTerror2Completion'),
    previous: 'taskwoodsTerror1',
    prereqQuests: [
      'taskwoodsTerror1',
    ],
    value: 4,
    goldValue: 300,
    category: 'gold',
    collect: {
      pixie: {
        text: t('questTaskwoodsTerror2CollectPixies'),
        count: 25,
      },
      brownie: {
        text: t('questTaskwoodsTerror2CollectBrownies'),
        count: 15,
      },
      dryad: {
        text: t('questTaskwoodsTerror2CollectDryads'),
        count: 10,
      },
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: 'armor_special_pyromancersRobes',
          text: t('questTaskwoodsTerror2DropArmor'),
        },
      ],
      gp: 0,
      exp: 75,
    },
  },
  taskwoodsTerror3: {
    text: t('questTaskwoodsTerror3Text'),
    notes: t('questTaskwoodsTerror3Notes'),
    group: 'questGroupTaskwoodsTerror',
    completion: t('questTaskwoodsTerror3Completion'),
    previous: 'taskwoodsTerror2',
    prereqQuests: [
      'taskwoodsTerror1',
      'taskwoodsTerror2',
    ],
    value: 4,
    goldValue: 400,
    category: 'gold',
    boss: {
      name: t('questTaskwoodsTerror3Boss'),
      hp: 1000,
      str: 2,
    },
    drop: {
      items: [
        {
          type: 'food',
          key: 'Strawberry',
          text: t('questTaskwoodsTerror3DropStrawberry'),
        }, {
          type: 'food',
          key: 'Strawberry',
          text: t('questTaskwoodsTerror3DropStrawberry'),
        }, {
          type: 'food',
          key: 'Strawberry',
          text: t('questTaskwoodsTerror3DropStrawberry'),
        }, {
          type: 'gear',
          key: 'weapon_special_taskwoodsLantern',
          text: t('questTaskwoodsTerror3DropWeapon'),
        },
      ],
      gp: 0,
      exp: 650,
    },
  },
  // final quest series in Masterclasser
  lostMasterclasser1: {
    text: t('questLostMasterclasser1Text'),
    notes: t('questLostMasterclasser1Notes'),
    group: 'questGroupLostMasterclasser',
    completion: t('questLostMasterclasser1Completion'),
    value: 4,
    prereqQuests: [
      'dilatoryDistress1',
      'dilatoryDistress2',
      'dilatoryDistress3',
      'mayhemMistiflying1',
      'mayhemMistiflying2',
      'mayhemMistiflying3',
      'stoikalmCalamity1',
      'stoikalmCalamity2',
      'stoikalmCalamity3',
      'taskwoodsTerror1',
      'taskwoodsTerror2',
      'taskwoodsTerror3',
    ],
    goldValue: 400,
    category: 'gold',
    collect: {
      ancientTome: {
        text: t('questLostMasterclasser1CollectAncientTomes'),
        count: 40,
      },
      forbiddenTome: {
        text: t('questLostMasterclasser1CollectForbiddenTomes'),
        count: 40,
      },
      hiddenTome: {
        text: t('questLostMasterclasser1CollectHiddenTomes'),
        count: 40,
      },
    },
    drop: {
      items: [
        {
          type: 'food',
          key: 'Potatoe',
          text: t('foodPotatoe'),
        }, {
          type: 'food',
          key: 'Potatoe',
          text: t('foodPotatoe'),
        }, {
          type: 'food',
          key: 'Potatoe',
          text: t('foodPotatoe'),
        }, {
          type: 'food',
          key: 'Meat',
          text: t('foodMeat'),
        }, {
          type: 'food',
          key: 'Meat',
          text: t('foodMeat'),
        }, {
          type: 'food',
          key: 'Meat',
          text: t('foodMeat'),
        }, {
          type: 'food',
          key: 'Milk',
          text: t('foodMilk'),
        }, {
          type: 'food',
          key: 'Milk',
          text: t('foodMilk'),
        }, {
          type: 'food',
          key: 'Milk',
          text: t('foodMilk'),
        },
      ],
      gp: 0,
      exp: 200,
    },
  },
  lostMasterclasser2: {
    text: t('questLostMasterclasser2Text'),
    notes: t('questLostMasterclasser2Notes'),
    group: 'questGroupLostMasterclasser',
    previous1: 'lostMasterclasser1',
    completion: t('questLostMasterclasser2Completion'),
    prereqQuests: [
      'lostMasterclasser1',
    ],
    value: 4,
    goldValue: 500,
    category: 'gold',
    boss: {
      name: t('questLostMasterclasser2Boss'),
      hp: 1500,
      str: 2.5,
    },
    drop: {
      items: [
        {
          type: 'food',
          key: 'Chocolate',
          text: t('foodChocolate'),
        }, {
          type: 'food',
          key: 'Chocolate',
          text: t('foodChocolate'),
        }, {
          type: 'food',
          key: 'Chocolate',
          text: t('foodChocolate'),
        }, {
          type: 'food',
          key: 'Honey',
          text: t('foodHoney'),
        }, {
          type: 'food',
          key: 'Honey',
          text: t('foodHoney'),
        }, {
          type: 'food',
          key: 'Honey',
          text: t('foodHoney'),
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('foodRottenMeat'),
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('foodRottenMeat'),
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('foodRottenMeat'),
        }, {
          type: 'gear',
          key: 'eyewear_special_aetherMask',
          text: t('questLostMasterclasser2DropEyewear'),
        },
      ],
      gp: 0,
      exp: 1500,
    },
  },
  lostMasterclasser3: {
    text: t('questLostMasterclasser3Text'),
    notes: t('questLostMasterclasser3Notes'),
    group: 'questGroupLostMasterclasser',
    completion: t('questLostMasterclasser3Completion'),
    previous: 'lostMasterclasser2',
    prereqQuests: [
      'lostMasterclasser1',
      'lostMasterclasser2',
    ],
    value: 4,
    goldValue: 600,
    category: 'gold',
    boss: {
      name: t('questLostMasterclasser3Boss'),
      hp: 2000,
      str: 3,
      rage: {
        title: t('questLostMasterclasser3RageTitle'),
        description: t('questLostMasterclasser3RageDescription'),
        value: 25,
        healing: 0.3,
        effect: t('questLostMasterclasser3RageEffect'),
      },
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Base',
          text: t('questLostMasterclasser3DropBasePotion'),
        }, {
          type: 'hatchingPotions',
          key: 'CottonCandyPink',
          text: t('questLostMasterclasser3DropPinkPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Golden',
          text: t('questLostMasterclasser3DropGoldenPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Shade',
          text: t('questLostMasterclasser3DropShadePotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Zombie',
          text: t('questLostMasterclasser3DropZombiePotion'),
        }, {
          type: 'gear',
          key: 'body_special_aetherAmulet',
          text: t('questLostMasterclasser3DropBodyAccessory'),
        },
      ],
      gp: 0,
      exp: 2000,
    },
  },
  lostMasterclasser4: {
    text: t('questLostMasterclasser4Text'),
    notes: t('questLostMasterclasser4Notes'),
    group: 'questGroupLostMasterclasser',
    completion: t('questLostMasterclasser4Completion'),
    previous: 'lostMasterclasser3',
    prereqQuests: [
      'lostMasterclasser1',
      'lostMasterclasser2',
      'lostMasterclasser3',
    ],
    value: 4,
    goldValue: 700,
    category: 'gold',
    boss: {
      name: t('questLostMasterclasser4Boss'),
      hp: 3000,
      str: 4,
      rage: {
        title: t('questLostMasterclasser4RageTitle'),
        description: t('questLostMasterclasser4RageDescription'),
        value: 15,
        mpDrain: true,
        effect: t('questLostMasterclasser4RageEffect'),
      },
    },
    drop: {
      items: [
        {
          type: 'mounts',
          key: 'Aether-Invisible',
          text: t('questLostMasterclasser4DropMount'),
        }, {
          type: 'gear',
          key: 'back_special_aetherCloak',
          text: t('questLostMasterclasser4DropBackAccessory'),
        }, {
          type: 'gear',
          key: 'weapon_special_aetherCrystals',
          text: t('questLostMasterclasser4DropWeapon'),
        },
      ],
      gp: 0,
      exp: 3500,
    },
  },
};

export default QUEST_MASTERCLASSER;
