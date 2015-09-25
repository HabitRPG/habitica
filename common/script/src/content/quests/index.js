import {each, defaults, sortBy} from 'lodash';
import {
  translator as t,
  merge,
  formatForTranslator
} from '../helpers';

import worldQuests from './world';
import holidayQuests from './holiday';
import petQuests from './pet';
import unlockableQuests from './unlockable';
import goldPurchasableQuests from './gold-purchasable';

let allQuests = merge([
  worldQuests,
  holidayQuests,
  petQuests,
  unlockableQuests,
  goldPurchasableQuests
]);

each(allQuests, function(quest, key) {
  let formattedName = formatForTranslator(key);

  let questDefaults = {
    key: key,
    text: t(`quest${formattedName}Text`),
    notes: t(`quest${formattedName}Notes`),
    canBuy: true,
    value: 4,
  };

  let questBossDefaults = {
    name: t(`quest${formattedName}Boss`),
    str: 1,
    def: 1,
  };

  let questBossRageDefaults = {
    title: t('bossRageTitle'),
    description: t('bossRageDescription'),
  };

  defaults(quest, questDefaults);

  let boss = quest.boss;

  if (boss) {
    defaults(boss, questBossDefaults);

    if (boss.rage) {
      defaults(boss.rage, questBossRageDefaults);
    }
  }
});

let questsByLevel = sortBy(allQuests, (quest) => {
  return quest.lvl || 0;
});

let canOwnCategories = [
  'unlockable',
  'gold',
  'pet',
];

export default {
  all: allQuests,
  byLevel: questsByLevel,
  canOwnCategories: canOwnCategories,
};
