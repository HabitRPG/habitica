import {
  translator as t,
  setQuestSetDefaults,
} from '../helpers';

let worldQuests = {
  dilatory: {
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
    completionChat: t('questStressbeastCompletionChat'),
    boss: {
      name: t('questStressbeastBoss'),
      hp: 2750000,
      str: 1,
      def: 1,
      rage: {
        title: t('questStressbeastBossRageTitle'),
        description: t('questStressbeastBossRageDescription'),
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
    completionChat: t('questBurnoutCompletionChat'),
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
};

let questDefaults = (name) => {
  return {
    completion: t(`quest${name}Completion`),
    value: 0,
    canBuy: () => { return false; },
    category: 'world',
  }
};

setQuestSetDefaults(worldQuests, questDefaults);

export default worldQuests;
