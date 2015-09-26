import {
  translator as t,
  setQuestSetDefaults,
} from '../helpers';

let petQuests = {
  gryphon: {
    boss: {
      hp: 300,
      str: 1.5,
    },
    drop: {
      gp: 25,
      exp: 125,
    }
  },
  hedgehog: {
    boss: {
      hp: 400,
      str: 1.25
    },
    drop: {
      gp: 30,
      exp: 125,
    }
  },
  ghost_stag: {
    boss: {
      hp: 1200,
      str: 2.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Deer',
          text: t('questGhostStagDropDeerEgg')
        }, {
          type: 'eggs',
          key: 'Deer',
          text: t('questGhostStagDropDeerEgg')
        }, {
          type: 'eggs',
          key: 'Deer',
          text: t('questGhostStagDropDeerEgg')
        }
      ],
      gp: 80,
      exp: 800,
    }
  },
  rat: {
    boss: {
      hp: 1200,
      str: 2.5
    },
    drop: {
      gp: 80,
      exp: 800,
    }
  },
  octopus: {
    boss: {
      hp: 1200,
      str: 2.5
    },
    drop: {
      gp: 80,
      exp: 800,
    }
  },
  dilatory_derby: {
    text: t('questSeahorseText'),
    notes: t('questSeahorseNotes'),
    completion: t('questSeahorseCompletion'),
    boss: {
      name: t('questSeahorseBoss'),
      hp: 300,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Seahorse',
          text: t('questSeahorseDropSeahorseEgg')
        }, {
          type: 'eggs',
          key: 'Seahorse',
          text: t('questSeahorseDropSeahorseEgg')
        }, {
          type: 'eggs',
          key: 'Seahorse',
          text: t('questSeahorseDropSeahorseEgg')
        }
      ],
      gp: 25,
      exp: 125,
      unlock: t('questSeahorseUnlockText')
    }
  },
  harpy: {
    boss: {
      hp: 600,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Parrot',
          text: t('questHarpyDropParrotEgg')
        }, {
          type: 'eggs',
          key: 'Parrot',
          text: t('questHarpyDropParrotEgg')
        }, {
          type: 'eggs',
          key: 'Parrot',
          text: t('questHarpyDropParrotEgg')
        }
      ],
      gp: 43,
      exp: 350,
    }
  },
  rooster: {
    boss: {
      hp: 300,
      str: 1.5
    },
    drop: {
      gp: 25,
      exp: 125,
    }
  },
  spider: {
    boss: {
      hp: 400,
      str: 1.5
    },
    drop: {
      gp: 31,
      exp: 200,
    }
  },
  owl: {
    boss: {
      hp: 500,
      str: 1.5
    },
    drop: {
      gp: 37,
      exp: 275,
    }
  },
  penguin: {
    boss: {
      hp: 400,
      str: 1.5
    },
    drop: {
      gp: 31,
      exp: 200,
    }
  },
  trex: {
    text: t('questTRexText'),
    notes: t('questTRexNotes'),
    completion: t('questTRexCompletion'),
    boss: {
      name: t('questTRexBoss'),
      hp: 800,
      str: 2
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg')
        }, {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg')
        }, {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg')
        }
      ],
      gp: 55,
      exp: 500,
      unlock: t('questTRexUnlockText')
    }
  },
  trex_undead: {
    text: t('questTRexUndeadText'),
    notes: t('questTRexUndeadNotes'),
    completion: t('questTRexUndeadCompletion'),
    boss: {
      name: t('questTRexUndeadBoss'),
      hp: 500,
      str: 2,
      rage: {
        title: t('questTRexUndeadRageTitle'),
        description: t('questTRexUndeadRageDescription'),
        value: 50,
        healing: .3,
        effect: t('questTRexUndeadRageEffect')
      }
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg')
        }, {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg')
        }, {
          type: 'eggs',
          key: 'TRex',
          text: t('questTRexDropTRexEgg')
        }
      ],
      gp: 55,
      exp: 500,
      unlock: t('questTRexUnlockText')
    }
  },
  rock: {
    boss: {
      hp: 400,
      str: 1.5
    },
    drop: {
      gp: 31,
      exp: 200,
    }
  },
  bunny: {
    boss: {
      hp: 300,
      str: 1.5
    },
    drop: {
      gp: 25,
      exp: 125,
    }
  },
  slime: {
    boss: {
      hp: 400,
      str: 1.5
    },
    drop: {
      gp: 31,
      exp: 200,
    }
  },
  sheep: {
    boss: {
      hp: 300,
      str: 1.5
    },
    drop: {
      gp: 25,
      exp: 125,
    }
  },
  kraken: {
    boss: {
      hp: 800,
      str: 2
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Cuttlefish',
          text: t('questKrakenDropCuttlefishEgg')
        }, {
          type: 'eggs',
          key: 'Cuttlefish',
          text: t('questKrakenDropCuttlefishEgg')
        }, {
          type: 'eggs',
          key: 'Cuttlefish',
          text: t('questKrakenDropCuttlefishEgg')
        }
      ],
      gp: 55,
      exp: 500,
    }
  },
  whale: {
    boss: {
      hp: 500,
      str: 1.5
    },
    drop: {
      gp: 37,
      exp: 275,
    }
  },
  cheetah: {
    boss: {
      hp: 600,
      str: 1.5
    },
    drop: {
      gp: 43,
      exp: 350,
    }
  },
  horse: {
    boss: {
      hp: 500,
      str: 1.5
    },
    drop: {
      gp: 37,
      exp: 275,
    }
  }
};

let questDefaults = (name) => {
  return {
    completion: t(`quest${name}Completion`),
    category: 'pet',
  }
};

let dropDefaults = (name) => {
  let eggReward = {
    type: 'eggs',
    key: name,
    text: t(`quest${name}Drop${name}Egg`)
  };

  return {
    items: [
      eggReward,
      eggReward,
      eggReward
    ],
    unlock: t(`quest${name}UnlockText`),
  };
};

setQuestSetDefaults(petQuests, questDefaults, dropDefaults);

export default petQuests;
