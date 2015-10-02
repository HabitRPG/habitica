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
