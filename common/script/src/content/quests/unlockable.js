import {
  translator as t,
  merge,
  setQuestSetDefaults,
} from '../helpers';

let inviteFriends = {
  basilist: {
    unlockCondition: {
      condition: 'party invite',
      text: t('inviteFriends')
    },
    boss: {
      hp: 100,
      str: 0.5
    },
    drop: {
      gp: 8,
      exp: 42
    }
  },
};

let viceSeries = {
  vice1: {
    lvl: 30,
    boss: {
      hp: 750,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'vice2',
          text: t('questVice1DropVice2Quest')
        }
      ],
      gp: 20,
      exp: 100
    }
  },
  vice2: {
    lvl: 30,
    previous: 'vice1',
    collect: {
      lightCrystal: {
        text: t('questVice2CollectLightCrystal'),
        count: 45
      }
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'vice3',
          text: t('questVice2DropVice3Quest')
        }
      ],
      gp: 20,
      exp: 75
    }
  },
  vice3: {
    completion: t('questVice3Completion'),
    previous: 'vice2',
    lvl: 30,
    boss: {
      hp: 1500,
      str: 3
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: 'weapon_special_2',
          text: t('questVice3DropWeaponSpecial2')
        }, {
          type: 'eggs',
          key: 'Dragon',
          text: t('questVice3DropDragonEgg')
        }, {
          type: 'eggs',
          key: 'Dragon',
          text: t('questVice3DropDragonEgg')
        }, {
          type: 'hatchingPotions',
          key: 'Shade',
          text: t('questVice3DropShadeHatchingPotion')
        }, {
          type: 'hatchingPotions',
          key: 'Shade',
          text: t('questVice3DropShadeHatchingPotion')
        }
      ],
      gp: 100,
      exp: 1000
    }
  },
};

let atomSeries = {
  atom1: {
    lvl: 15,
    collect: {
      soapBars: {
        text: t('questAtom1CollectSoapBars'),
        count: 20
      }
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'atom2',
          text: t('questAtom1Drop')
        }
      ],
      gp: 7,
      exp: 50
    }
  },
  atom2: {
    previous: 'atom1',
    lvl: 15,
    boss: {
      hp: 300,
      str: 1
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'atom3',
          text: t('questAtom2Drop')
        }
      ],
      gp: 20,
      exp: 100
    }
  },
  atom3: {
    previous: 'atom2',
    completion: t('questAtom3Completion'),
    lvl: 15,
    boss: {
      hp: 800,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: 'head_special_2',
          text: t('headSpecial2Text')
        }, {
          type: 'hatchingPotions',
          key: 'Base',
          text: t('questAtom3DropPotion')
        }, {
          type: 'hatchingPotions',
          key: 'Base',
          text: t('questAtom3DropPotion')
        }
      ],
      gp: 25,
      exp: 125
    }
  },
};

let moonstoneSeries = {
  moonstone1: {
    lvl: 60,
    collect: {
      moonstone: {
        text: t('questMoonstone1CollectMoonstone'),
        count: 500
      }
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'moonstone2',
          text: t('questMoonstone1DropMoonstone2Quest')
        }
      ],
      gp: 50,
      exp: 100
    }
  },
  moonstone2: {
    lvl: 60,
    previous: 'moonstone1',
    boss: {
      hp: 1500,
      str: 3
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'moonstone3',
          text: t('questMoonstone2DropMoonstone3Quest')
        }
      ],
      gp: 500,
      exp: 1000
    }
  },
  moonstone3: {
    completion: t('questMoonstone3Completion'),
    previous: 'moonstone2',
    lvl: 60,
    boss: {
      hp: 2000,
      str: 3.5
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: 'armor_special_2',
          text: t('armorSpecial2Text')
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('questMoonstone3DropRottenMeat')
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('questMoonstone3DropRottenMeat')
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('questMoonstone3DropRottenMeat')
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('questMoonstone3DropRottenMeat')
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('questMoonstone3DropRottenMeat')
        }, {
          type: 'hatchingPotions',
          key: 'Zombie',
          text: t('questMoonstone3DropZombiePotion')
        }, {
          type: 'hatchingPotions',
          key: 'Zombie',
          text: t('questMoonstone3DropZombiePotion')
        }, {
          type: 'hatchingPotions',
          key: 'Zombie',
          text: t('questMoonstone3DropZombiePotion')
        }
      ],
      gp: 900,
      exp: 1500
    }
  },
};

let goldenKnightSeries = {
  goldenknight1: {
    lvl: 40,
    collect: {
      testimony: {
        text: t('questGoldenknight1CollectTestimony'),
        count: 300
      }
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'goldenknight2',
          text: t('questGoldenknight1DropGoldenknight2Quest')
        }
      ],
      gp: 15,
      exp: 120
    }
  },
  goldenknight2: {
    previous: 'goldenknight1',
    lvl: 40,
    boss: {
      hp: 1000,
      str: 3
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: 'goldenknight3',
          text: t('questGoldenknight2DropGoldenknight3Quest')
        }
      ],
      gp: 75,
      exp: 750
    }
  },
  goldenknight3: {
    completion: t('questGoldenknight3Completion'),
    previous: 'goldenknight2',
    lvl: 40,
    boss: {
      hp: 1700,
      str: 3.5
    },
    drop: {
      items: [
        {
          type: 'food',
          key: 'Honey',
          text: t('questGoldenknight3DropHoney')
        }, {
          type: 'food',
          key: 'Honey',
          text: t('questGoldenknight3DropHoney')
        }, {
          type: 'food',
          key: 'Honey',
          text: t('questGoldenknight3DropHoney')
        }, {
          type: 'hatchingPotions',
          key: 'Golden',
          text: t('questGoldenknight3DropGoldenPotion')
        }, {
          type: 'hatchingPotions',
          key: 'Golden',
          text: t('questGoldenknight3DropGoldenPotion')
        }, {
          type: 'gear',
          key: 'shield_special_goldenknight',
          text: t('questGoldenknight3DropWeapon')
        }
      ],
      gp: 900,
      exp: 1500
    }
  },
};

let unlockableQuests = merge([
  inviteFriends,
  atomSeries,
  viceSeries,
  moonstoneSeries,
  goldenKnightSeries,
]);

let questDefaults = () => {
  return { category: 'unlockable' }
};

setQuestSetDefaults(unlockableQuests, questDefaults);

export default unlockableQuests;
