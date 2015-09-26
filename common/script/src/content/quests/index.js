import {sortBy} from 'lodash';
import {
  merge,
  setQuestDefaults,
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
