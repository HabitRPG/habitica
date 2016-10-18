import _ from 'lodash';
import moment from 'moment';
import t from './translation';

import {
  CLASSES,
  EVENTS,
  GEAR_TYPES,
  ITEM_LIST,
  USER_CAN_OWN_QUEST_CATEGORIES,
} from './constants';

let api = module.exports;

import mysterySets from './mystery-sets';

import eggs from './eggs';
import hatchingPotions from './hatching-potions';
import stable from './stable';
import gear from './gear';

import appearances from './appearance';
import backgrounds from './appearance/backgrounds.js'
import spells from './spells';
import faq from './faq';

api.mystery = mysterySets;

api.itemList = ITEM_LIST;

api.gear = gear;
api.spells = spells;

/*
   Time Traveler Store, mystery sets need their items mapped in
   */

_.each(api.mystery, function(v, k) {
  return v.items = _.where(api.gear.flat, {
    mystery: k
  });
});

api.timeTravelerStore = function(owned) {
  var ownedKeys;
  ownedKeys = _.keys((typeof owned.toObject === "function" ? owned.toObject() : void 0) || owned);
  return _.reduce(api.mystery, function(m, v, k) {
    if (k === 'wondercon' || ~ownedKeys.indexOf(v.items[0].key)) {
      return m;
    }
    m[k] = v;
    return m;
  }, {});
};


/*
   ---------------------------------------------------------------
   Unique Rewards: Potion and Armoire
   ---------------------------------------------------------------
   */

api.potion = {
  type: 'potion',
  text: t('potionText'),
  notes: t('potionNotes'),
  value: 25,
  key: 'potion'
};

api.armoire = {
  type: 'armoire',
  text: t('armoireText'),
  notes: (function(user, count) {
    if (user.flags.armoireEmpty) {
      return t('armoireNotesEmpty')();
    }
    return t('armoireNotesFull')() + count;
  }),
  value: 100,
  key: 'armoire',
  canOwn: (function(u) {
    return _.contains(u.achievements.ultimateGearSets, true);
  })
};


/*
   ---------------------------------------------------------------
   Classes
   ---------------------------------------------------------------
   */

api.classes = CLASSES;


/*
   ---------------------------------------------------------------
   Gear Types
   ---------------------------------------------------------------
   */

api.gearTypes = GEAR_TYPES;

api.cardTypes = {
  greeting: {
    key: 'greeting',
    messageOptions: 4,
    yearRound: true
  },
  nye: {
    key: 'nye',
    messageOptions: 5
  },
  thankyou: {
    key: 'thankyou',
    messageOptions: 4,
    yearRound: true
  },
  valentine: {
    key: 'valentine',
    messageOptions: 4
  },
  birthday: {
    key: 'birthday',
    messageOptions: 1,
    yearRound: true,
  },
};

api.special = api.spells.special;

api.dropEggs = eggs.drops;
api.questEggs = eggs.quests;
api.eggs = eggs.all;

api.timeTravelStable = {
  pets: {
    'Mammoth-Base': t('mammoth'),
    'MantisShrimp-Base': t('mantisShrimp'),
    'Phoenix-Base': t('phoenix'),
  },
  mounts: {
    'Mammoth-Base': t('mammoth'),
    'MantisShrimp-Base': t('mantisShrimp'),
    'Phoenix-Base': t('phoenix'),
  }
};

api.dropHatchingPotions = hatchingPotions.drops;
api.premiumHatchingPotions = hatchingPotions.premium;
api.hatchingPotions = hatchingPotions.all;

api.pets = stable.dropPets;
api.premiumPets = stable.premiumPets;
api.questPets = stable.questPets;
api.specialPets = stable.specialPets;
api.petInfo = stable.petInfo;

api.mounts = stable.dropMounts;
api.questMounts = stable.questMounts;
api.premiumMounts = stable.premiumMounts;
api.specialMounts = stable.specialMounts;
api.mountInfo = stable.mountInfo;

api.food = {
  Meat: {
    text: t('foodMeat'),
    target: 'Base',
    article: '',
    canBuy: (function() {
      return false;
    }),
    canDrop: false,
  },
  Milk: {
    text: t('foodMilk'),
    target: 'White',
    article: '',
    canBuy: (function() {
      return false;
    }),
    canDrop: false,
  },
  Potatoe: {
    text: t('foodPotatoe'),
    target: 'Desert',
    article: 'a ',
    canBuy: (function() {
      return false;
    }),
    canDrop: false,
  },
  Strawberry: {
    text: t('foodStrawberry'),
    target: 'Red',
    article: 'a ',
    canBuy: (function() {
      return false;
    }),
    canDrop: false,
  },
  Chocolate: {
    text: t('foodChocolate'),
    target: 'Shade',
    article: '',
    canBuy: (function() {
      return false;
    }),
    canDrop: false,
  },
  Fish: {
    text: t('foodFish'),
    target: 'Skeleton',
    article: 'a ',
    canBuy: (function() {
      return false;
    }),
    canDrop: false,
  },
  RottenMeat: {
    text: t('foodRottenMeat'),
    target: 'Zombie',
    article: '',
    canBuy: (function() {
      return false;
    }),
    canDrop: false,
  },
  CottonCandyPink: {
    text: t('foodCottonCandyPink'),
    target: 'CottonCandyPink',
    article: '',
    canBuy: (function() {
      return false;
    }),
    canDrop: false,
  },
  CottonCandyBlue: {
    text: t('foodCottonCandyBlue'),
    target: 'CottonCandyBlue',
    article: '',
    canBuy: (function() {
      return false;
    }),
    canDrop: false,
  },
  Honey: {
    text: t('foodHoney'),
    target: 'Golden',
    article: '',
    canBuy: (function() {
      return false;
    }),
    canDrop: false,
  },
  Saddle: {
    canBuy: (function() {
      return true;
    }),
    text: t('foodSaddleText'),
    value: 5,
    notes: t('foodSaddleNotes')
  },
  Cake_Skeleton: {
    text: t('foodCakeSkeleton'),
    target: 'Skeleton',
    article: '',
  },
  Cake_Base: {
    text: t('foodCakeBase'),
    target: 'Base',
    article: '',
  },
  Cake_CottonCandyBlue: {
    text: t('foodCakeCottonCandyBlue'),
    target: 'CottonCandyBlue',
    article: '',
  },
  Cake_CottonCandyPink: {
    text: t('foodCakeCottonCandyPink'),
    target: 'CottonCandyPink',
    article: '',
  },
  Cake_Shade: {
    text: t('foodCakeShade'),
    target: 'Shade',
    article: '',
  },
  Cake_White: {
    text: t('foodCakeWhite'),
    target: 'White',
    article: '',
  },
  Cake_Golden: {
    text: t('foodCakeGolden'),
    target: 'Golden',
    article: '',
  },
  Cake_Zombie: {
    text: t('foodCakeZombie'),
    target: 'Zombie',
    article: '',
  },
  Cake_Desert: {
    text: t('foodCakeDesert'),
    target: 'Desert',
    article: '',
  },
  Cake_Red: {
    text: t('foodCakeRed'),
    target: 'Red',
    article: '',
  },
  Candy_Skeleton: {
    text: t('foodCandySkeleton'),
    target: 'Skeleton',
    article: '',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  Candy_Base: {
    text: t('foodCandyBase'),
    target: 'Base',
    article: '',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  Candy_CottonCandyBlue: {
    text: t('foodCandyCottonCandyBlue'),
    target: 'CottonCandyBlue',
    article: '',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  Candy_CottonCandyPink: {
    text: t('foodCandyCottonCandyPink'),
    target: 'CottonCandyPink',
    article: '',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  Candy_Shade: {
    text: t('foodCandyShade'),
    target: 'Shade',
    article: '',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  Candy_White: {
    text: t('foodCandyWhite'),
    target: 'White',
    article: '',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  Candy_Golden: {
    text: t('foodCandyGolden'),
    target: 'Golden',
    article: '',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  Candy_Zombie: {
    text: t('foodCandyZombie'),
    target: 'Zombie',
    article: '',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  Candy_Desert: {
    text: t('foodCandyDesert'),
    target: 'Desert',
    article: '',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  },
  Candy_Red: {
    text: t('foodCandyRed'),
    target: 'Red',
    article: '',
    canBuy: (function() {
      return true;
    }),
    canDrop: true,
  }
};

_.each(api.food, function(food, key) {
  return _.defaults(food, {
    value: 1,
    key: key,
    notes: t('foodNotes'),
    canBuy: (function() {
      return false;
    }),
    canDrop: false
  });
});

api.userCanOwnQuestCategories = USER_CAN_OWN_QUEST_CATEGORIES;

api.quests = {
  dilatory: {
    text: t("questDilatoryText"),
    notes: t("questDilatoryNotes"),
    completion: t("questDilatoryCompletion"),
    value: 0,
    canBuy: (function() {
      return false;
    }),
    category: 'world',
    boss: {
      name: t("questDilatoryBoss"),
      hp: 5000000,
      str: 1,
      def: 1,
      rage: {
        title: t("questDilatoryBossRageTitle"),
        description: t("questDilatoryBossRageDescription"),
        value: 4000000,
        tavern: t('questDilatoryBossRageTavern'),
        stables: t('questDilatoryBossRageStables'),
        market: t('questDilatoryBossRageMarket')
      }
    },
    drop: {
      items: [
        {
          type: 'pets',
          key: 'MantisShrimp-Base',
          text: t('questDilatoryDropMantisShrimpPet')
        }, {
          type: 'mounts',
          key: 'MantisShrimp-Base',
          text: t('questDilatoryDropMantisShrimpMount')
        }, {
          type: 'food',
          key: 'Meat',
          text: t('foodMeat')
        }, {
          type: 'food',
          key: 'Milk',
          text: t('foodMilk')
        }, {
          type: 'food',
          key: 'Potatoe',
          text: t('foodPotatoe')
        }, {
          type: 'food',
          key: 'Strawberry',
          text: t('foodStrawberry')
        }, {
          type: 'food',
          key: 'Chocolate',
          text: t('foodChocolate')
        }, {
          type: 'food',
          key: 'Fish',
          text: t('foodFish')
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('foodRottenMeat')
        }, {
          type: 'food',
          key: 'CottonCandyPink',
          text: t('foodCottonCandyPink')
        }, {
          type: 'food',
          key: 'CottonCandyBlue',
          text: t('foodCottonCandyBlue')
        }, {
          type: 'food',
          key: 'Honey',
          text: t('foodHoney')
        }
      ],
      gp: 0,
      exp: 0
    }
  },
  stressbeast: {
    text: t("questStressbeastText"),
    notes: t("questStressbeastNotes"),
    completion: t("questStressbeastCompletion"),
    completionChat: t("questStressbeastCompletionChat"),
    value: 0,
    canBuy: (function() {
      return false;
    }),
    category: 'world',
    boss: {
      name: t("questStressbeastBoss"),
      hp: 2750000,
      str: 1,
      def: 1,
      rage: {
        title: t("questStressbeastBossRageTitle"),
        description: t("questStressbeastBossRageDescription"),
        value: 1450000,
        healing: .3,
        stables: t('questStressbeastBossRageStables'),
        bailey: t('questStressbeastBossRageBailey'),
        guide: t('questStressbeastBossRageGuide')
      },
      desperation: {
        threshold: 500000,
        str: 3.5,
        def: 2,
        text: t('questStressbeastDesperation')
      }
    },
    drop: {
      items: [
        {
          type: 'pets',
          key: 'Mammoth-Base',
          text: t('questStressbeastDropMammothPet')
        }, {
          type: 'mounts',
          key: 'Mammoth-Base',
          text: t('questStressbeastDropMammothMount')
        }, {
          type: 'food',
          key: 'Meat',
          text: t('foodMeat')
        }, {
          type: 'food',
          key: 'Milk',
          text: t('foodMilk')
        }, {
          type: 'food',
          key: 'Potatoe',
          text: t('foodPotatoe')
        }, {
          type: 'food',
          key: 'Strawberry',
          text: t('foodStrawberry')
        }, {
          type: 'food',
          key: 'Chocolate',
          text: t('foodChocolate')
        }, {
          type: 'food',
          key: 'Fish',
          text: t('foodFish')
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('foodRottenMeat')
        }, {
          type: 'food',
          key: 'CottonCandyPink',
          text: t('foodCottonCandyPink')
        }, {
          type: 'food',
          key: 'CottonCandyBlue',
          text: t('foodCottonCandyBlue')
        }, {
          type: 'food',
          key: 'Honey',
          text: t('foodHoney')
        }
      ],
      gp: 0,
      exp: 0
    }
  },
  burnout: {
    text: t('questBurnoutText'),
    notes: t('questBurnoutNotes'),
    completion: t('questBurnoutCompletion'),
    completionChat: t('questBurnoutCompletionChat'),
    value: 0,
    canBuy: (function() {
      return false;
    }),
    category: 'world',
    boss: {
      name: t('questBurnoutBoss'),
      hp: 11000000,
      str: 2.5,
      def: 1,
      rage: {
        title: t('questBurnoutBossRageTitle'),
        description: t('questBurnoutBossRageDescription'),
        value: 1000000,
        quests: t('questBurnoutBossRageQuests'),
        seasonalShop: t('questBurnoutBossRageSeasonalShop'),
        tavern: t('questBurnoutBossRageTavern')
      }
    },
    drop: {
      items: [
        {
          type: 'pets',
          key: 'Phoenix-Base',
          text: t('questBurnoutDropPhoenixPet')
        }, {
          type: 'mounts',
          key: 'Phoenix-Base',
          text: t('questBurnoutDropPhoenixMount')
        }, {
          type: 'food',
          key: 'Candy_Base',
          text: t('foodCandyBase')
        }, {
          type: 'food',
          key: 'Candy_White',
          text: t('foodCandyWhite')
        }, {
          type: 'food',
          key: 'Candy_Desert',
          text: t('foodCandyDesert')
        }, {
          type: 'food',
          key: 'Candy_Red',
          text: t('foodCandyRed')
        }, {
          type: 'food',
          key: 'Candy_Shade',
          text: t('foodCandyShade')
        }, {
          type: 'food',
          key: 'Candy_Skeleton',
          text: t('foodCandySkeleton')
        }, {
          type: 'food',
          key: 'Candy_Zombie',
          text: t('foodCandyZombie')
        }, {
          type: 'food',
          key: 'Candy_CottonCandyPink',
          text: t('foodCandyCottonCandyPink')
        }, {
          type: 'food',
          key: 'Candy_CottonCandyBlue',
          text: t('foodCandyCottonCandyBlue')
        }, {
          type: 'food',
          key: 'Candy_Golden',
          text: t('foodCandyGolden')
        }
      ],
      gp: 0,
      exp: 0
    }
  },
  evilsanta: {
    canBuy: (function() {
      return false;
    }),
    text: t('questEvilSantaText'),
    notes: t('questEvilSantaNotes'),
    completion: t('questEvilSantaCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questEvilSantaBoss'),
      hp: 300,
      str: 1
    },
    drop: {
      items: [
        {
          type: 'mounts',
          key: 'BearCub-Polar',
          text: t('questEvilSantaDropBearCubPolarMount')
        }
      ],
      gp: 20,
      exp: 100
    }
  },
  evilsanta2: {
    canBuy: (function() {
      return false;
    }),
    text: t('questEvilSanta2Text'),
    notes: t('questEvilSanta2Notes'),
    completion: t('questEvilSanta2Completion'),
    value: 4,
    category: 'pet',
    collect: {
      tracks: {
        text: t('questEvilSanta2CollectTracks'),
        count: 20
      },
      branches: {
        text: t('questEvilSanta2CollectBranches'),
        count: 10
      }
    },
    drop: {
      items: [
        {
          type: 'pets',
          key: 'BearCub-Polar',
          text: t('questEvilSanta2DropBearCubPolarPet')
        }
      ],
      gp: 20,
      exp: 100
    }
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
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Gryphon',
          text: t('questGryphonDropGryphonEgg')
        }, {
          type: 'eggs',
          key: 'Gryphon',
          text: t('questGryphonDropGryphonEgg')
        }, {
          type: 'eggs',
          key: 'Gryphon',
          text: t('questGryphonDropGryphonEgg')
        }
      ],
      gp: 25,
      exp: 125,
      unlock: t('questGryphonUnlockText')
    }
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
      str: 1.25
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Hedgehog',
          text: t('questHedgehogDropHedgehogEgg')
        }, {
          type: 'eggs',
          key: 'Hedgehog',
          text: t('questHedgehogDropHedgehogEgg')
        }, {
          type: 'eggs',
          key: 'Hedgehog',
          text: t('questHedgehogDropHedgehogEgg')
        }
      ],
      gp: 30,
      exp: 125,
      unlock: t('questHedgehogUnlockText')
    }
  },
  ghost_stag: {
    text: t('questGhostStagText'),
    notes: t('questGhostStagNotes'),
    completion: t('questGhostStagCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questGhostStagBoss'),
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
      unlock: t('questGhostStagUnlockText')
    }
  },
  vice1: {
    text: t('questVice1Text'),
    notes: t('questVice1Notes'),
    value: 4,
    lvl: 30,
    category: 'unlockable',
    boss: {
      name: t('questVice1Boss'),
      hp: 750,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: "vice2",
          text: t('questVice1DropVice2Quest')
        }
      ],
      gp: 20,
      exp: 100
    }
  },
  vice2: {
    text: t('questVice2Text'),
    notes: t('questVice2Notes'),
    value: 4,
    lvl: 30,
    category: 'unlockable',
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
    text: t('questVice3Text'),
    notes: t('questVice3Notes'),
    completion: t('questVice3Completion'),
    previous: 'vice2',
    value: 4,
    lvl: 30,
    category: 'unlockable',
    boss: {
      name: t('questVice3Boss'),
      hp: 1500,
      str: 3
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: "weapon_special_2",
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
  egg: {
    text: t('questEggHuntText'),
    notes: t('questEggHuntNotes'),
    completion: t('questEggHuntCompletion'),
    value: 1,
    canBuy: (function() {
      return false;
    }),
    category: 'pet',
    collect: {
      plainEgg: {
        text: t('questEggHuntCollectPlainEgg'),
        count: 100
      }
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }
      ],
      gp: 0,
      exp: 0
    }
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
      str: 2.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Rat',
          text: t('questRatDropRatEgg')
        }, {
          type: 'eggs',
          key: 'Rat',
          text: t('questRatDropRatEgg')
        }, {
          type: 'eggs',
          key: 'Rat',
          text: t('questRatDropRatEgg')
        }
      ],
      gp: 80,
      exp: 800,
      unlock: t('questRatUnlockText')
    }
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
      str: 2.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Octopus',
          text: t('questOctopusDropOctopusEgg')
        }, {
          type: 'eggs',
          key: 'Octopus',
          text: t('questOctopusDropOctopusEgg')
        }, {
          type: 'eggs',
          key: 'Octopus',
          text: t('questOctopusDropOctopusEgg')
        }
      ],
      gp: 80,
      exp: 800,
      unlock: t('questOctopusUnlockText')
    }
  },
  dilatory_derby: {
    text: t('questSeahorseText'),
    notes: t('questSeahorseNotes'),
    completion: t('questSeahorseCompletion'),
    value: 4,
    category: 'pet',
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
  atom1: {
    text: t('questAtom1Text'),
    notes: t('questAtom1Notes'),
    value: 4,
    lvl: 15,
    category: 'unlockable',
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
          key: "atom2",
          text: t('questAtom1Drop')
        }
      ],
      gp: 7,
      exp: 50
    }
  },
  atom2: {
    text: t('questAtom2Text'),
    notes: t('questAtom2Notes'),
    previous: 'atom1',
    value: 4,
    lvl: 15,
    category: 'unlockable',
    boss: {
      name: t('questAtom2Boss'),
      hp: 300,
      str: 1
    },
    drop: {
      items: [
        {
          type: 'quests',
          key: "atom3",
          text: t('questAtom2Drop')
        }
      ],
      gp: 20,
      exp: 100
    }
  },
  atom3: {
    text: t('questAtom3Text'),
    notes: t('questAtom3Notes'),
    previous: 'atom2',
    completion: t('questAtom3Completion'),
    value: 4,
    lvl: 15,
    category: 'unlockable',
    boss: {
      name: t('questAtom3Boss'),
      hp: 800,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: "head_special_2",
          text: t('headSpecial2Text')
        }, {
          type: 'hatchingPotions',
          key: "Base",
          text: t('questAtom3DropPotion')
        }, {
          type: 'hatchingPotions',
          key: "Base",
          text: t('questAtom3DropPotion')
        }
      ],
      gp: 25,
      exp: 125
    }
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
      unlock: t('questHarpyUnlockText')
    }
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
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Rooster',
          text: t('questRoosterDropRoosterEgg')
        }, {
          type: 'eggs',
          key: 'Rooster',
          text: t('questRoosterDropRoosterEgg')
        }, {
          type: 'eggs',
          key: 'Rooster',
          text: t('questRoosterDropRoosterEgg')
        }
      ],
      gp: 25,
      exp: 125,
      unlock: t('questRoosterUnlockText')
    }
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
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Spider',
          text: t('questSpiderDropSpiderEgg')
        }, {
          type: 'eggs',
          key: 'Spider',
          text: t('questSpiderDropSpiderEgg')
        }, {
          type: 'eggs',
          key: 'Spider',
          text: t('questSpiderDropSpiderEgg')
        }
      ],
      gp: 31,
      exp: 200,
      unlock: t('questSpiderUnlockText')
    }
  },
  moonstone1: {
    text: t('questMoonstone1Text'),
    notes: t('questMoonstone1Notes'),
    value: 4,
    lvl: 60,
    category: 'unlockable',
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
          key: "moonstone2",
          text: t('questMoonstone1DropMoonstone2Quest')
        }
      ],
      gp: 50,
      exp: 100
    }
  },
  moonstone2: {
    text: t('questMoonstone2Text'),
    notes: t('questMoonstone2Notes'),
    value: 4,
    lvl: 60,
    previous: 'moonstone1',
    category: 'unlockable',
    boss: {
      name: t('questMoonstone2Boss'),
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
    text: t('questMoonstone3Text'),
    notes: t('questMoonstone3Notes'),
    completion: t('questMoonstone3Completion'),
    previous: 'moonstone2',
    value: 4,
    lvl: 60,
    category: 'unlockable',
    boss: {
      name: t('questMoonstone3Boss'),
      hp: 2000,
      str: 3.5
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: "armor_special_2",
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
  goldenknight1: {
    text: t('questGoldenknight1Text'),
    notes: t('questGoldenknight1Notes'),
    value: 4,
    lvl: 40,
    category: 'unlockable',
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
          key: "goldenknight2",
          text: t('questGoldenknight1DropGoldenknight2Quest')
        }
      ],
      gp: 15,
      exp: 120
    }
  },
  goldenknight2: {
    text: t('questGoldenknight2Text'),
    notes: t('questGoldenknight2Notes'),
    value: 4,
    previous: 'goldenknight1',
    lvl: 40,
    category: 'unlockable',
    boss: {
      name: t('questGoldenknight2Boss'),
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
    text: t('questGoldenknight3Text'),
    notes: t('questGoldenknight3Notes'),
    completion: t('questGoldenknight3Completion'),
    previous: 'goldenknight2',
    value: 4,
    lvl: 40,
    category: 'unlockable',
    boss: {
      name: t('questGoldenknight3Boss'),
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
  basilist: {
    text: t('questBasilistText'),
    notes: t('questBasilistNotes'),
    completion: t('questBasilistCompletion'),
    value: 4,
    category: 'unlockable',
    unlockCondition: {
      condition: 'party invite',
      text: t('inviteFriends')
    },
    boss: {
      name: t('questBasilistBoss'),
      hp: 100,
      str: 0.5
    },
    drop: {
      gp: 8,
      exp: 42
    }
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
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Owl',
          text: t('questOwlDropOwlEgg')
        }, {
          type: 'eggs',
          key: 'Owl',
          text: t('questOwlDropOwlEgg')
        }, {
          type: 'eggs',
          key: 'Owl',
          text: t('questOwlDropOwlEgg')
        }
      ],
      gp: 37,
      exp: 275,
      unlock: t('questOwlUnlockText')
    }
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
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Penguin',
          text: t('questPenguinDropPenguinEgg')
        }, {
          type: 'eggs',
          key: 'Penguin',
          text: t('questPenguinDropPenguinEgg')
        }, {
          type: 'eggs',
          key: 'Penguin',
          text: t('questPenguinDropPenguinEgg')
        }
      ],
      gp: 31,
      exp: 200,
      unlock: t('questPenguinUnlockText')
    }
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
    value: 4,
    category: 'pet',
    boss: {
      name: t('questTRexUndeadBoss'),
      hp: 500,
      str: 2,
      rage: {
        title: t("questTRexUndeadRageTitle"),
        description: t("questTRexUndeadRageDescription"),
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
    text: t('questRockText'),
    notes: t('questRockNotes'),
    completion: t('questRockCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questRockBoss'),
      hp: 400,
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Rock',
          text: t('questRockDropRockEgg')
        }, {
          type: 'eggs',
          key: 'Rock',
          text: t('questRockDropRockEgg')
        }, {
          type: 'eggs',
          key: 'Rock',
          text: t('questRockDropRockEgg')
        }
      ],
      gp: 31,
      exp: 200,
      unlock: t('questRockUnlockText')
    }
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
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Bunny',
          text: t('questBunnyDropBunnyEgg')
        }, {
          type: 'eggs',
          key: 'Bunny',
          text: t('questBunnyDropBunnyEgg')
        }, {
          type: 'eggs',
          key: 'Bunny',
          text: t('questBunnyDropBunnyEgg')
        }
      ],
      gp: 25,
      exp: 125,
      unlock: t('questBunnyUnlockText')
    }
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
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Slime',
          text: t('questSlimeDropSlimeEgg')
        }, {
          type: 'eggs',
          key: 'Slime',
          text: t('questSlimeDropSlimeEgg')
        }, {
          type: 'eggs',
          key: 'Slime',
          text: t('questSlimeDropSlimeEgg')
        }
      ],
      gp: 31,
      exp: 200,
      unlock: t('questSlimeUnlockText')
    }
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
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Sheep',
          text: t('questSheepDropSheepEgg')
        }, {
          type: 'eggs',
          key: 'Sheep',
          text: t('questSheepDropSheepEgg')
        }, {
          type: 'eggs',
          key: 'Sheep',
          text: t('questSheepDropSheepEgg')
        }
      ],
      gp: 25,
      exp: 125,
      unlock: t('questSheepUnlockText')
    }
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
      unlock: t('questKrakenUnlockText')
    }
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
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Whale',
          text: t('questWhaleDropWhaleEgg')
        }, {
          type: 'eggs',
          key: 'Whale',
          text: t('questWhaleDropWhaleEgg')
        }, {
          type: 'eggs',
          key: 'Whale',
          text: t('questWhaleDropWhaleEgg')
        }
      ],
      gp: 37,
      exp: 275,
      unlock: t('questWhaleUnlockText')
    }
  },
  dilatoryDistress1: {
    text: t('questDilatoryDistress1Text'),
    notes: t('questDilatoryDistress1Notes'),
    completion: t('questDilatoryDistress1Completion'),
    value: 4,
    goldValue: 200,
    category: 'gold',
    collect: {
      fireCoral: {
        text: t('questDilatoryDistress1CollectFireCoral'),
        count: 25
      },
      blueFins: {
        text: t('questDilatoryDistress1CollectBlueFins'),
        count: 25
      }
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: "armor_special_finnedOceanicArmor",
          text: t('questDilatoryDistress1DropArmor')
        }
      ],
      gp: 0,
      exp: 75
    }
  },
  dilatoryDistress2: {
    text: t('questDilatoryDistress2Text'),
    notes: t('questDilatoryDistress2Notes'),
    completion: t('questDilatoryDistress2Completion'),
    previous: 'dilatoryDistress1',
    value: 4,
    goldValue: 300,
    category: 'gold',
    boss: {
      name: t('questDilatoryDistress2Boss'),
      hp: 500,
      rage: {
        title: t("questDilatoryDistress2RageTitle"),
        description: t("questDilatoryDistress2RageDescription"),
        value: 50,
        healing: .3,
        effect: t('questDilatoryDistress2RageEffect')
      }
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Skeleton',
          text: t('questDilatoryDistress2DropSkeletonPotion')
        }, {
          type: 'hatchingPotions',
          key: 'CottonCandyBlue',
          text: t('questDilatoryDistress2DropCottonCandyBluePotion')
        }, {
          type: 'gear',
          key: "head_special_fireCoralCirclet",
          text: t('questDilatoryDistress2DropHeadgear')
        }
      ],
      gp: 0,
      exp: 500
    }
  },
  dilatoryDistress3: {
    text: t('questDilatoryDistress3Text'),
    notes: t('questDilatoryDistress3Notes'),
    completion: t('questDilatoryDistress3Completion'),
    previous: 'dilatoryDistress2',
    value: 4,
    goldValue: 400,
    category: 'gold',
    boss: {
      name: t('questDilatoryDistress3Boss'),
      hp: 1000,
      str: 2
    },
    drop: {
      items: [
        {
          type: 'food',
          key: 'Fish',
          text: t('questDilatoryDistress3DropFish')
        }, {
          type: 'food',
          key: 'Fish',
          text: t('questDilatoryDistress3DropFish')
        }, {
          type: 'food',
          key: 'Fish',
          text: t('questDilatoryDistress3DropFish')
        }, {
          type: 'gear',
          key: "weapon_special_tridentOfCrashingTides",
          text: t('questDilatoryDistress3DropWeapon')
        }, {
          type: 'gear',
          key: "shield_special_moonpearlShield",
          text: t('questDilatoryDistress3DropShield')
        }
      ],
      gp: 0,
      exp: 650
    }
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
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Cheetah',
          text: t('questCheetahDropCheetahEgg')
        }, {
          type: 'eggs',
          key: 'Cheetah',
          text: t('questCheetahDropCheetahEgg')
        }, {
          type: 'eggs',
          key: 'Cheetah',
          text: t('questCheetahDropCheetahEgg')
        }
      ],
      gp: 43,
      exp: 350,
      unlock: t('questCheetahUnlockText')
    }
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
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Horse',
          text: t('questHorseDropHorseEgg')
        }, {
          type: 'eggs',
          key: 'Horse',
          text: t('questHorseDropHorseEgg')
        }, {
          type: 'eggs',
          key: 'Horse',
          text: t('questHorseDropHorseEgg')
        }
      ],
      gp: 37,
      exp: 275,
      unlock: t('questHorseUnlockText')
    }
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
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Frog',
          text: t('questFrogDropFrogEgg')
        }, {
          type: 'eggs',
          key: 'Frog',
          text: t('questFrogDropFrogEgg')
        }, {
          type: 'eggs',
          key: 'Frog',
          text: t('questFrogDropFrogEgg')
        }
      ],
      gp: 25,
      exp: 125,
      unlock: t('questFrogUnlockText')
    }
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
      str: 2.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Snake',
          text: t('questSnakeDropSnakeEgg')
        }, {
          type: 'eggs',
          key: 'Snake',
          text: t('questSnakeDropSnakeEgg')
        }, {
          type: 'eggs',
          key: 'Snake',
          text: t('questSnakeDropSnakeEgg')
        }
      ],
      gp: 73,
      exp: 725,
      unlock: t('questSnakeUnlockText')
    }
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
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Unicorn',
          text: t('questUnicornDropUnicornEgg')
        }, {
          type: 'eggs',
          key: 'Unicorn',
          text: t('questUnicornDropUnicornEgg')
        }, {
          type: 'eggs',
          key: 'Unicorn',
          text: t('questUnicornDropUnicornEgg')
        }
      ],
      gp: 43,
      exp: 350,
      unlock: t('questUnicornUnlockText')
    }
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
      str: 2
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Sabretooth',
          text: t('questSabretoothDropSabretoothEgg')
        }, {
          type: 'eggs',
          key: 'Sabretooth',
          text: t('questSabretoothDropSabretoothEgg')
        }, {
          type: 'eggs',
          key: 'Sabretooth',
          text: t('questSabretoothDropSabretoothEgg')
        }
      ],
      gp: 67,
      exp: 650,
      unlock: t('questSabretoothUnlockText')
    }
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
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Monkey',
          text: t('questMonkeyDropMonkeyEgg')
        }, {
          type: 'eggs',
          key: 'Monkey',
          text: t('questMonkeyDropMonkeyEgg')
        }, {
          type: 'eggs',
          key: 'Monkey',
          text: t('questMonkeyDropMonkeyEgg')
        }
      ],
      gp: 31,
      exp: 200,
      unlock: t('questMonkeyUnlockText')
    }
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
      str: 1.5
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Snail',
          text: t('questSnailDropSnailEgg')
        }, {
          type: 'eggs',
          key: 'Snail',
          text: t('questSnailDropSnailEgg')
        }, {
          type: 'eggs',
          key: 'Snail',
          text: t('questSnailDropSnailEgg')
        }
      ],
      gp: 37,
      exp: 275,
      unlock: t('questSnailUnlockText')
    }
  },
  bewilder: {
    text: t("questBewilderText"),
    notes: t("questBewilderNotes"),
    completion: t("questBewilderCompletion"),
    completionChat: t('questBewilderCompletionChat'),
    value: 0,
    canBuy: (function() {
      return false;
    }),
    category: 'world',
    boss: {
      name: t("questBewilderText"),
      hp: 20000000,
      str: 1,
      def: 1,
      rage: {
        title: t("questBewilderBossRageTitle"),
        description: t("questBewilderBossRageDescription"),
        value: 800000,
        bailey: t('questBewilderBossRageBailey'),
        stables: t('questBewilderBossRageStables'),
        market: t('questBewilderBossRageMarket')
      }
    },
    drop: {
      items: [
        {
          type: 'pets',
          key: 'MagicalBee-Base',
          text: t('questBewilderDropBumblebeePet')
        }, {
          type: 'mounts',
          key: 'MagicalBee-Base',
          text: t('questBewilderDropBumblebeeMount')
        }, {
          type: 'food',
          key: 'Meat',
          text: t('foodMeat')
        }, {
          type: 'food',
          key: 'Milk',
          text: t('foodMilk')
        }, {
          type: 'food',
          key: 'Potatoe',
          text: t('foodPotatoe')
        }, {
          type: 'food',
          key: 'Strawberry',
          text: t('foodStrawberry')
        }, {
          type: 'food',
          key: 'Chocolate',
          text: t('foodChocolate')
        }, {
          type: 'food',
          key: 'Fish',
          text: t('foodFish')
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('foodRottenMeat')
        }, {
          type: 'food',
          key: 'CottonCandyPink',
          text: t('foodCottonCandyPink')
        }, {
          type: 'food',
          key: 'CottonCandyBlue',
          text: t('foodCottonCandyBlue')
        }, {
          type: 'food',
          key: 'Honey',
          text: t('foodHoney')
        },
      ],
      gp: 0,
      exp: 0,
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
        }
      ],
      gp: 49,
      exp: 425,
      unlock: t('questFalconUnlockText'),
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
        }
      ],
      gp: 43,
      exp: 350,
      unlock: t('questTreelingUnlockText'),
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
        healing: .3,
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
        }
      ],
      gp: 37,
      exp: 275,
      unlock: t('questAxolotlUnlockText'),
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
        }
      ],
      gp: 25,
      exp: 125,
      unlock: t('questTurtleUnlockText'),
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
        }
      ],
      gp: 43,
      exp: 350,
      unlock: t('questArmadilloUnlockText'),
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
        }
      ],
      gp: 31,
      exp: 200,
      unlock: t('questCowUnlockText'),
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
  taskwoodsTerror1: {
    text: t('questTaskwoodsTerror1Text'),
    notes: t('questTaskwoodsTerror1Notes'),
    completion: t('questTaskwoodsTerror1Completion'),
    value: 4,
    goldValue: 200,
    category: 'gold',
    boss: {
      name: t('questTaskwoodsTerror1Boss'),
      hp: 500,
      rage: {
        title: t("questTaskwoodsTerror1RageTitle"),
        description: t("questTaskwoodsTerror1RageDescription"),
        value: 50,
        healing: .3,
        effect: t('questTaskwoodsTerror1RageEffect')
      }
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Skeleton',
          text: t('questTaskwoodsTerror1DropSkeletonPotion')
        }, {
          type: 'hatchingPotions',
          key: 'Red',
          text: t('questTaskwoodsTerror1DropRedPotion')
        }, {
          type: 'gear',
          key: "head_special_pyromancersTurban",
          text: t('questTaskwoodsTerror1DropHeadgear')
        }
      ],
      gp: 0,
      exp: 500
    }
  },
  taskwoodsTerror2: {
    text: t('questTaskwoodsTerror2Text'),
    notes: t('questTaskwoodsTerror2Notes'),
    completion: t('questTaskwoodsTerror2Completion'),
    previous: 'taskwoodsTerror1',
    value: 4,
    goldValue: 300,
    category: 'gold',
    collect: {
      pixie: {
        text: t('questTaskwoodsTerror2CollectPixies'),
        count: 25
      },
      brownie: {
        text: t('questTaskwoodsTerror2CollectBrownies'),
        count: 15
      },
      dryad: {
        text: t('questTaskwoodsTerror2CollectDryads'),
        count: 10
      },
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: "armor_special_pyromancersRobes",
          text: t('questTaskwoodsTerror2DropArmor')
        }
      ],
      gp: 0,
      exp: 75
    }
  },
  taskwoodsTerror3: {
    text: t('questTaskwoodsTerror3Text'),
    notes: t('questTaskwoodsTerror3Notes'),
    completion: t('questTaskwoodsTerror3Completion'),
    previous: 'taskwoodsTerror2',
    value: 4,
    goldValue: 400,
    category: 'gold',
    boss: {
      name: t('questTaskwoodsTerror3Boss'),
      hp: 1000,
      str: 2
    },
    drop: {
      items: [
        {
          type: 'food',
          key: 'Strawberry',
          text: t('questTaskwoodsTerror3DropStrawberry')
        }, {
          type: 'food',
          key: 'Strawberry',
          text: t('questTaskwoodsTerror3DropStrawberry')
        }, {
          type: 'food',
          key: 'Strawberry',
          text: t('questTaskwoodsTerror3DropStrawberry')
        }, {
          type: 'gear',
          key: "weapon_special_taskwoodsLantern",
          text: t('questTaskwoodsTerror3DropWeapon')
        },
      ],
      gp: 0,
      exp: 650
    }
  },
};

_.each(api.quests, function(v, key) {
  var b;
  _.defaults(v, {
    key: key,
    canBuy: (function() {
      return true;
    })
  });
  b = v.boss;
  if (b) {
    _.defaults(b, {
      str: 1,
      def: 1
    });
    if (b.rage) {
      return _.defaults(b.rage, {
        title: t('bossRageTitle'),
        description: t('bossRageDescription')
      });
    }
  }
});

api.questsByLevel = _.sortBy(api.quests, function(quest) {
  return quest.lvl || 0;
});

api.appearances = appearances;

api.backgrounds = backgrounds;

api.subscriptionBlocks = {
  basic_earned: {
    months: 1,
    price: 5
  },
  basic_3mo: {
    months: 3,
    price: 15
  },
  basic_6mo: {
    months: 6,
    price: 30
  },
  google_6mo: {
    months: 6,
    price: 24,
    discount: true,
    original: 30
  },
  basic_12mo: {
    months: 12,
    price: 48
  }
};

_.each(api.subscriptionBlocks, function(b, k) {
  return b.key = k;
});

api.userDefaults = {
  habits: [
    {
      type: 'habit',
      text: t('defaultHabit1Text'),
      value: 0,
      up: true,
      down: false,
      attribute: 'per'
    }, {
      type: 'habit',
      text: t('defaultHabit2Text'),
      value: 0,
      up: false,
      down: true,
      attribute: 'str'
    }, {
      type: 'habit',
      text: t('defaultHabit3Text'),
      value: 0,
      up: true,
      down: true,
      attribute: 'str'
    }
  ],
  dailys: [],
  todos: [
    {
      type: 'todo',
      text: t('defaultTodo1Text'),
      notes: t('defaultTodoNotes'),
      completed: false,
      attribute: 'int'
    }
  ],
  rewards: [
    {
      type: 'reward',
      text: t('defaultReward1Text'),
      value: 10
    }
  ],
  tags: [
    {
      name: t('defaultTag1')
    }, {
      name: t('defaultTag2')
    }, {
      name: t('defaultTag3')
    }, {
      name: t('defaultTag4')
    }, {
      name: t('defaultTag5')
    }, {
      name: t('defaultTag6')
    }, {
      name: t('defaultTag7')
    }
  ]
};

api.faq = faq;
