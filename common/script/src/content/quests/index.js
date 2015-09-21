import {each, assign, defaults, sortBy} from 'lodash';
import capitalize from 'lodash.capitalize';
import camelCase from 'lodash.camelcase';
import t from '../helpers/translator';

import worldQuests from './world';
import holidayQuests from './holiday';
import petQuests from './pet';
import unlockableQuests from './unlockable';
import goldPurchasableQuests from './gold-purchasable';

let allQuests = { };

assign(allQuests, worldQuests);
assign(allQuests, holidayQuests);
assign(allQuests, petQuests);
assign(allQuests, unlockableQuests);
assign(allQuests, goldPurchasableQuests);

each(allQuests, function(quest, key) {
  let camelName = camelCase(key);
  let capitalizedName = capitalize(camelName);

  let questDefaults = {
    key: key,
    text: t(`quest${capitalizedName}Text`),
    notes: t(`quest${capitalizedName}Notes`),
    canBuy: true,
    value: 4,
  };

  let questBossDefaults = {
    name: t(`quest${capitalizedName}Boss`),
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
  allQuests: allQuests,
  byLevel: questsByLevel,
  canOwnCategories: canOwnCategories,
};
