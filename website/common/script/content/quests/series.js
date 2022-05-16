import t from '../translation';

const QUEST_SERIES = {
  atom1: {
    text: t('questAtom1Text'),
    notes: t('questAtom1Notes'),
    completion: t('questAtom1Completion'),
    group: 'questGroupAtom',
    prerequisite: {
      lvl: 15,
    },
    value: 4,
    lvl: 15,
    category: 'unlockable',
    collect: {
      soapBars: {
        text: t('questAtom1CollectSoapBars'),
        count: 20,
      },
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'atom2',
          text: t('questAtom1Drop'),
          onlyOwner: true,
        },
      ],
      gp: 7,
      exp: 50,
    },
  },
  atom2: {
    text: t('questAtom2Text'),
    notes: t('questAtom2Notes'),
    completion: t('questAtom2Completion'),
    group: 'questGroupAtom',
    previous: 'atom1',
    prereqQuests: [
      'atom1',
    ],
    value: 4,
    lvl: 15,
    category: 'unlockable',
    boss: {
      name: t('questAtom2Boss'),
      hp: 300,
      str: 1,
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'atom3',
          text: t('questAtom2Drop'),
          onlyOwner: true,
        },
      ],
      gp: 20,
      exp: 100,
    },
  },
  atom3: {
    text: t('questAtom3Text'),
    notes: t('questAtom3Notes'),
    group: 'questGroupAtom',
    previous: 'atom2',
    prereqQuests: [
      'atom1',
      'atom2',
    ],
    completion: t('questAtom3Completion'),
    value: 4,
    lvl: 15,
    category: 'unlockable',
    boss: {
      name: t('questAtom3Boss'),
      hp: 800,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: 'head_special_2',
          text: t('headSpecial2Text'),
        }, {
          type: 'hatchingPotions',
          key: 'Base',
          text: t('questAtom3DropPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Base',
          text: t('questAtom3DropPotion'),
        },
      ],
      gp: 25,
      exp: 125,
    },
  },
  goldenknight1: {
    text: t('questGoldenknight1Text'),
    notes: t('questGoldenknight1Notes'),
    completion: t('questGoldenknight1Completion'),
    group: 'questGroupGoldenknight',
    value: 4,
    lvl: 40,
    category: 'unlockable',
    collect: {
      testimony: {
        text: t('questGoldenknight1CollectTestimony'),
        count: 60,
      },
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'goldenknight2',
          text: t('questGoldenknight1DropGoldenknight2Quest'),
          onlyOwner: true,
        },
      ],
      gp: 15,
      exp: 120,
    },
  },
  goldenknight2: {
    text: t('questGoldenknight2Text'),
    notes: t('questGoldenknight2Notes'),
    completion: t('questGoldenknight2Completion'),
    group: 'questGroupGoldenknight',
    value: 4,
    previous: 'goldenknight1',
    prereqQuests: [
      'goldenknight1',
    ],
    lvl: 40,
    category: 'unlockable',
    boss: {
      name: t('questGoldenknight2Boss'),
      hp: 1000,
      str: 3,
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'goldenknight3',
          text: t('questGoldenknight2DropGoldenknight3Quest'),
          onlyOwner: true,
        },
      ],
      gp: 75,
      exp: 750,
    },
  },
  goldenknight3: {
    text: t('questGoldenknight3Text'),
    notes: t('questGoldenknight3Notes'),
    group: 'questGroupGoldenknight',
    completion: t('questGoldenknight3Completion'),
    previous: 'goldenknight2',
    prereqQuests: [
      'goldenknight1',
      'goldenknight2',
    ],
    value: 4,
    lvl: 40,
    category: 'unlockable',
    boss: {
      name: t('questGoldenknight3Boss'),
      hp: 1700,
      str: 3.5,
    },
    drop: {
      items: [
        {
          type: 'food',
          key: 'Honey',
          text: t('questGoldenknight3DropHoney'),
        }, {
          type: 'food',
          key: 'Honey',
          text: t('questGoldenknight3DropHoney'),
        }, {
          type: 'food',
          key: 'Honey',
          text: t('questGoldenknight3DropHoney'),
        }, {
          type: 'hatchingPotions',
          key: 'Golden',
          text: t('questGoldenknight3DropGoldenPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Golden',
          text: t('questGoldenknight3DropGoldenPotion'),
        }, {
          type: 'gear',
          key: 'shield_special_goldenknight',
          text: t('questGoldenknight3DropWeapon'),
        },
      ],
      gp: 900,
      exp: 1500,
    },
  },
  moon1: {
    text: t('questMoon1Text'),
    notes: t('questMoon1Notes'),
    group: 'questGroupMoon',
    completion: t('questMoon1Completion'),
    value: 4,
    category: 'unlockable',
    unlockCondition: {
      condition: 'login reward',
      incentiveThreshold: 7,
      text: t('loginReward', { count: 7 }),
    },
    collect: {
      shard: {
        text: t('questMoon1CollectShards'),
        count: 20,
      },
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: 'head_special_lunarWarriorHelm',
          text: t('questMoon1DropHeadgear'),
        },
      ],
      gp: 7,
      exp: 50,
    },
  },
  moon2: {
    text: t('questMoon2Text'),
    notes: t('questMoon2Notes'),
    group: 'questGroupMoon',
    completion: t('questMoon2Completion'),
    previous: 'moon1',
    prereqQuests: [
      'moon1',
    ],
    value: 4,
    category: 'unlockable',
    unlockCondition: {
      condition: 'login reward',
      incentiveThreshold: 22,
      text: t('loginReward', { count: 22 }),
    },
    boss: {
      name: t('questMoon2Boss'),
      hp: 100,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: 'armor_special_lunarWarriorArmor',
          text: t('questMoon2DropArmor'),
        },
      ],
      gp: 37,
      exp: 275,
    },
  },
  moon3: {
    text: t('questMoon3Text'),
    notes: t('questMoon3Notes'),
    group: 'questGroupMoon',
    completion: t('questMoon3Completion'),
    previous: 'moon2',
    prereqQuests: [
      'moon1',
      'moon2',
    ],
    value: 4,
    category: 'unlockable',
    unlockCondition: {
      condition: 'login reward',
      incentiveThreshold: 40,
      text: t('loginReward', { count: 40 }),
    },
    boss: {
      name: t('questMoon3Boss'),
      hp: 1000,
      str: 2,
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: 'weapon_special_lunarScythe',
          text: t('questMoon3DropWeapon'),
        },
      ],
      gp: 67,
      exp: 650,
    },
  },
  moonstone1: {
    text: t('questMoonstone1Text'),
    notes: t('questMoonstone1Notes'),
    completion: t('questMoonstone1Completion'),
    group: 'questGroupMoonstone',
    value: 4,
    lvl: 60,
    category: 'unlockable',
    collect: {
      moonstone: {
        text: t('questMoonstone1CollectMoonstone'),
        count: 100,
      },
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'moonstone2',
          text: t('questMoonstone1DropMoonstone2Quest'),
          onlyOwner: true,
        },
      ],
      gp: 50,
      exp: 100,
    },
  },
  moonstone2: {
    text: t('questMoonstone2Text'),
    notes: t('questMoonstone2Notes'),
    completion: t('questMoonstone2Completion'),
    group: 'questGroupMoonstone',
    value: 4,
    lvl: 60,
    previous: 'moonstone1',
    prereqQuests: [
      'moonstone1',
    ],
    category: 'unlockable',
    boss: {
      name: t('questMoonstone2Boss'),
      hp: 1500,
      str: 3,
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'moonstone3',
          text: t('questMoonstone2DropMoonstone3Quest'),
          onlyOwner: true,
        },
      ],
      gp: 500,
      exp: 1000,
    },
  },
  moonstone3: {
    text: t('questMoonstone3Text'),
    notes: t('questMoonstone3Notes'),
    group: 'questGroupMoonstone',
    completion: t('questMoonstone3Completion'),
    previous: 'moonstone2',
    prereqQuests: [
      'moonstone1',
      'moonstone2',
    ],
    value: 4,
    lvl: 60,
    category: 'unlockable',
    boss: {
      name: t('questMoonstone3Boss'),
      hp: 2000,
      str: 3.5,
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: 'armor_special_2',
          text: t('armorSpecial2Text'),
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('questMoonstone3DropRottenMeat'),
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('questMoonstone3DropRottenMeat'),
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('questMoonstone3DropRottenMeat'),
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('questMoonstone3DropRottenMeat'),
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('questMoonstone3DropRottenMeat'),
        }, {
          type: 'hatchingPotions',
          key: 'Zombie',
          text: t('questMoonstone3DropZombiePotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Zombie',
          text: t('questMoonstone3DropZombiePotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Zombie',
          text: t('questMoonstone3DropZombiePotion'),
        },
      ],
      gp: 900,
      exp: 1500,
    },
  },
  vice1: {
    text: t('questVice1Text'),
    notes: t('questVice1Notes'),
    completion: t('questVice1Completion'),
    group: 'questGroupVice',
    value: 4,
    lvl: 30,
    category: 'unlockable',
    boss: {
      name: t('questVice1Boss'),
      hp: 750,
      str: 1.5,
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'vice2',
          text: t('questVice1DropVice2Quest'),
          onlyOwner: true,
        },
      ],
      gp: 20,
      exp: 100,
    },
  },
  vice2: {
    text: t('questVice2Text'),
    notes: t('questVice2Notes'),
    completion: t('questVice2Completion'),
    group: 'questGroupVice',
    value: 4,
    lvl: 30,
    category: 'unlockable',
    previous: 'vice1',
    prereqQuests: [
      'vice1',
    ],
    collect: {
      lightCrystal: {
        text: t('questVice2CollectLightCrystal'),
        count: 30,
      },
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'vice3',
          text: t('questVice2DropVice3Quest'),
          onlyOwner: true,
        },
      ],
      gp: 20,
      exp: 75,
    },
  },
  vice3: {
    text: t('questVice3Text'),
    notes: t('questVice3Notes'),
    group: 'questGroupVice',
    completion: t('questVice3Completion'),
    previous: 'vice2',
    prereqQuests: [
      'vice1',
      'vice2',
    ],
    value: 4,
    lvl: 30,
    category: 'unlockable',
    boss: {
      name: t('questVice3Boss'),
      hp: 1500,
      str: 3,
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: 'weapon_special_2',
          text: t('questVice3DropWeaponSpecial2'),
        }, {
          type: 'eggs',
          key: 'Dragon',
          text: t('questVice3DropDragonEgg'),
        }, {
          type: 'eggs',
          key: 'Dragon',
          text: t('questVice3DropDragonEgg'),
        }, {
          type: 'hatchingPotions',
          key: 'Shade',
          text: t('questVice3DropShadeHatchingPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Shade',
          text: t('questVice3DropShadeHatchingPotion'),
        },
      ],
      gp: 100,
      exp: 1000,
    },
  },
};

export default QUEST_SERIES;
