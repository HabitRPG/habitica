import {sortBy} from 'lodash';
import {
  merge,
  setQuestDefaults,
} from '../helpers';

//--------------------------------------------------
// Quests are series objects that have defaults applied if not provided
//
// <quest_key> : {
//  key: <quest_key>,
//  text: t(quest<formatted_key>text),
//  notes: t(quest<formatted_key>notes),
//  canBuy: <canBuy_boolean>,
//  value: <value>,
//  boss: <boss_values>
//  drop: <drop_values>
// }
//
//  <quest_key> is the name of the quest
//  <formatted_key> is a screeaming camelCase version of the key
//  <canBuy_boolean> is a boolean passed in as part of an options object
//  <value> is the price of the quest in gems - defaults to 4
//  <boss_value> only applies to boss quests. An object in this form: {
//      name: t(quest<formatted_key>Boss),
//      str: <str_value>,
//      def: <def_value>,
//      rage: <rage_values>,
//    }
//  <rage_values> only applies to boss quests with rage. An object in this form: {
//      title: t('bossRageTitle'),
//      description: t('bossRageDescription')
//   }
// <drop_values> only applies if quest has drops. An object in this form: {
//      items: <item_array>,
//      gp: <gp>,
//      exp: <exp>,
//      unlock: t(quest<formatted_key>UnlockText),
//  }
// <item_array> an array of objects representing the items that will be dropped
// <gp> the amount of gp awarded for completing the quest
// <exp> the amount of exp awareded for completing the quest
//--------------------------------------------------

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

setQuestDefaults(allQuests);

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
