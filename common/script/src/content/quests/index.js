import {each, assign, defaults, sortBy} from 'lodash';
import t from '../helpers/translator';

import worldQuests from './world';
import holidayQuests from './holiday';
import petQuests from './pet';
import unlockableQuests from './unlockable';
import goldPurchasableQuests from './gold-purchasable';

const QUEST_BOSS_DEFAULTS = { str: 1, def: 1 };
const QUEST_BOSS_RAGE_DEFAULTS = {
  title: t('bossRageTitle'),
  description: t('bossRageDescription'),
};

let allQuests = { };

assign(allQuests, worldQuests);
assign(allQuests, holidayQuests);
assign(allQuests, petQuests);
assign(allQuests, unlockableQuests);
assign(allQuests, goldPurchasableQuests);

each(allQuests, function(quest, key) {
  defaults(quest, {
    key: key,
    canBuy: true
  });

  let boss = quest.boss;

  if (boss) {
    defaults(boss, QUEST_BOSS_DEFAULTS);

    if (boss.rage) {
      defaults(boss.rage, QUEST_BOSS_RAGE_DEFAULTS);
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
