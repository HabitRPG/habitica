import t from '../translation';

const QUEST_WORLD = {
  bewilder: {
    text: t('questBewilderText'),
    notes: t('questBewilderNotes'),
    completion: t('questBewilderCompletion'),
    completionChat: t('questBewilderCompletionChat'),
    value: 0,
    canBuy () {
      return false;
    },
    category: 'world',
    boss: {
      name: t('questBewilderText'),
      hp: 20000000,
      str: 1,
      def: 1,
      rage: {
        title: t('questBewilderBossRageTitle'),
        description: t('questBewilderBossRageDescription'),
        value: 800000,
        bailey: t('questBewilderBossRageBailey'),
        stables: t('questBewilderBossRageStables'),
        market: t('questBewilderBossRageMarket'),
      },
    },
    drop: {
      items: [
        {
          type: 'pets',
          key: 'MagicalBee-Base',
          text: t('questBewilderDropBumblebeePet'),
        }, {
          type: 'mounts',
          key: 'MagicalBee-Base',
          text: t('questBewilderDropBumblebeeMount'),
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
          key: 'Potatoe',
          text: t('foodPotatoe'),
        }, {
          type: 'food',
          key: 'Strawberry',
          text: t('foodStrawberry'),
        }, {
          type: 'food',
          key: 'Chocolate',
          text: t('foodChocolate'),
        }, {
          type: 'food',
          key: 'Fish',
          text: t('foodFish'),
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('foodRottenMeat'),
        }, {
          type: 'food',
          key: 'CottonCandyPink',
          text: t('foodCottonCandyPink'),
        }, {
          type: 'food',
          key: 'CottonCandyBlue',
          text: t('foodCottonCandyBlue'),
        }, {
          type: 'food',
          key: 'Honey',
          text: t('foodHoney'),
        },
      ],
      gp: 0,
      exp: 0,
    },
  },
  burnout: {
    text: t('questBurnoutText'),
    notes: t('questBurnoutNotes'),
    completion: t('questBurnoutCompletion'),
    completionChat: t('questBurnoutCompletionChat'),
    value: 0,
    canBuy () {
      return false;
    },
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
        tavern: t('questBurnoutBossRageTavern'),
      },
    },
    drop: {
      items: [
        {
          type: 'pets',
          key: 'Phoenix-Base',
          text: t('questBurnoutDropPhoenixPet'),
        }, {
          type: 'mounts',
          key: 'Phoenix-Base',
          text: t('questBurnoutDropPhoenixMount'),
        }, {
          type: 'food',
          key: 'Candy_Base',
          text: t('foodCandyBase'),
        }, {
          type: 'food',
          key: 'Candy_White',
          text: t('foodCandyWhite'),
        }, {
          type: 'food',
          key: 'Candy_Desert',
          text: t('foodCandyDesert'),
        }, {
          type: 'food',
          key: 'Candy_Red',
          text: t('foodCandyRed'),
        }, {
          type: 'food',
          key: 'Candy_Shade',
          text: t('foodCandyShade'),
        }, {
          type: 'food',
          key: 'Candy_Skeleton',
          text: t('foodCandySkeleton'),
        }, {
          type: 'food',
          key: 'Candy_Zombie',
          text: t('foodCandyZombie'),
        }, {
          type: 'food',
          key: 'Candy_CottonCandyPink',
          text: t('foodCandyCottonCandyPink'),
        }, {
          type: 'food',
          key: 'Candy_CottonCandyBlue',
          text: t('foodCandyCottonCandyBlue'),
        }, {
          type: 'food',
          key: 'Candy_Golden',
          text: t('foodCandyGolden'),
        },
      ],
      gp: 0,
      exp: 0,
    },
  },
  dilatory: {
    text: t('questDilatoryText'),
    notes: t('questDilatoryNotes'),
    completion: t('questDilatoryCompletion'),
    value: 0,
    canBuy () {
      return false;
    },
    category: 'world',
    boss: {
      name: t('questDilatoryBoss'),
      hp: 5000000,
      str: 1,
      def: 1,
      rage: {
        title: t('questDilatoryBossRageTitle'),
        description: t('questDilatoryBossRageDescription'),
        value: 4000000,
        tavern: t('questDilatoryBossRageTavern'),
        stables: t('questDilatoryBossRageStables'),
        market: t('questDilatoryBossRageMarket'),
      },
    },
    drop: {
      items: [
        {
          type: 'pets',
          key: 'MantisShrimp-Base',
          text: t('questDilatoryDropMantisShrimpPet'),
        }, {
          type: 'mounts',
          key: 'MantisShrimp-Base',
          text: t('questDilatoryDropMantisShrimpMount'),
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
          key: 'Potatoe',
          text: t('foodPotatoe'),
        }, {
          type: 'food',
          key: 'Strawberry',
          text: t('foodStrawberry'),
        }, {
          type: 'food',
          key: 'Chocolate',
          text: t('foodChocolate'),
        }, {
          type: 'food',
          key: 'Fish',
          text: t('foodFish'),
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('foodRottenMeat'),
        }, {
          type: 'food',
          key: 'CottonCandyPink',
          text: t('foodCottonCandyPink'),
        }, {
          type: 'food',
          key: 'CottonCandyBlue',
          text: t('foodCottonCandyBlue'),
        }, {
          type: 'food',
          key: 'Honey',
          text: t('foodHoney'),
        },
      ],
      gp: 0,
      exp: 0,
    },
  },
  dysheartener: {
    text: t('questDysheartenerText'),
    notes: t('questDysheartenerNotes'),
    completion: t('questDysheartenerCompletion'),
    completionChat: t('questDysheartenerCompletionChat'),
    value: 0,
    canBuy () {
      return false;
    },
    category: 'world',
    boss: {
      name: t('questDysheartenerText'),
      hp: 17000000,
      str: 1.25,
      def: 1,
      rage: {
        title: t('questDysheartenerBossRageTitle'),
        description: t('questDysheartenerBossRageDescription'),
        value: 500000,
        seasonalShop: t('questDysheartenerBossRageSeasonal'),
        market: t('questDysheartenerBossRageMarket'),
        quests: t('questDysheartenerBossRageQuests'),
      },
    },
    colors: {
      dark: '#410F2A',
      medium: '#5C1130',
      light: '#931F4D',
      extralight: '#DC4069',
    },
    drop: {
      items: [
        {
          type: 'pets',
          key: 'Hippogriff-Hopeful',
          text: t('questDysheartenerDropHippogriffPet'),
        }, {
          type: 'mounts',
          key: 'Hippogriff-Hopeful',
          text: t('questDysheartenerDropHippogriffMount'),
        }, {
          type: 'food',
          key: 'Cake_Base',
          text: t('foodCakeBase'),
        }, {
          type: 'food',
          key: 'Candy_White',
          text: t('foodCandyWhite'),
        }, {
          type: 'food',
          key: 'Cake_Desert',
          text: t('foodCakeDesert'),
        }, {
          type: 'food',
          key: 'Candy_Red',
          text: t('foodCandyRed'),
        }, {
          type: 'food',
          key: 'Cake_Shade',
          text: t('foodCakeShade'),
        }, {
          type: 'food',
          key: 'Candy_Skeleton',
          text: t('foodCandySkeleton'),
        }, {
          type: 'food',
          key: 'Cake_Zombie',
          text: t('foodCakeZombie'),
        }, {
          type: 'food',
          key: 'Candy_CottonCandyPink',
          text: t('foodCandyCottonCandyPink'),
        }, {
          type: 'food',
          key: 'Candy_CottonCandyBlue',
          text: t('foodCandyCottonCandyBlue'),
        }, {
          type: 'food',
          key: 'Cake_Golden',
          text: t('foodCakeGolden'),
        },
      ],
      gp: 0,
      exp: 0,
    },
  },
  stressbeast: {
    text: t('questStressbeastText'),
    notes: t('questStressbeastNotes'),
    completion: t('questStressbeastCompletion'),
    completionChat: t('questStressbeastCompletionChat'),
    value: 0,
    canBuy () {
      return false;
    },
    category: 'world',
    boss: {
      name: t('questStressbeastBoss'),
      hp: 2750000,
      str: 1,
      def: 1,
      rage: {
        title: t('questStressbeastBossRageTitle'),
        description: t('questStressbeastBossRageDescription'),
        value: 1450000,
        healing: 0.3,
        stables: t('questStressbeastBossRageStables'),
        bailey: t('questStressbeastBossRageBailey'),
        guide: t('questStressbeastBossRageGuide'),
      },
      desperation: {
        threshold: 500000,
        str: 3.5,
        def: 2,
        text: t('questStressbeastDesperation'),
      },
    },
    drop: {
      items: [
        {
          type: 'pets',
          key: 'Mammoth-Base',
          text: t('questStressbeastDropMammothPet'),
        }, {
          type: 'mounts',
          key: 'Mammoth-Base',
          text: t('questStressbeastDropMammothMount'),
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
          key: 'Potatoe',
          text: t('foodPotatoe'),
        }, {
          type: 'food',
          key: 'Strawberry',
          text: t('foodStrawberry'),
        }, {
          type: 'food',
          key: 'Chocolate',
          text: t('foodChocolate'),
        }, {
          type: 'food',
          key: 'Fish',
          text: t('foodFish'),
        }, {
          type: 'food',
          key: 'RottenMeat',
          text: t('foodRottenMeat'),
        }, {
          type: 'food',
          key: 'CottonCandyPink',
          text: t('foodCottonCandyPink'),
        }, {
          type: 'food',
          key: 'CottonCandyBlue',
          text: t('foodCottonCandyBlue'),
        }, {
          type: 'food',
          key: 'Honey',
          text: t('foodHoney'),
        },
      ],
      gp: 0,
      exp: 0,
    },
  },
};

export default QUEST_WORLD;
