import defaults from 'lodash/defaults';
import each from 'lodash/each';
import sortBy from 'lodash/sortBy';
import t from './translation';
import {
  USER_CAN_OWN_QUEST_CATEGORIES,
  QUEST_GENERIC,
  QUEST_MASTERCLASSER,
  QUEST_PETS,
  QUEST_POTIONS,
  QUEST_SEASONAL,
  QUEST_SERIES,
  QUEST_TIME_TRAVEL,
  QUEST_WORLD,
} from './constants';

const userCanOwnQuestCategories = USER_CAN_OWN_QUEST_CATEGORIES;
const questGeneric = QUEST_GENERIC;
const questMasterclasser = QUEST_MASTERCLASSER;
const questPets = QUEST_PETS;
const questPotions = QUEST_POTIONS;
const questSeasonal = QUEST_SEASONAL;
const questSeries = QUEST_SERIES;
const questTimeTravel = QUEST_TIME_TRAVEL;
const questWorld = QUEST_WORLD;

// this uses the spread operator, which allows us to combine multiple objects into one
const quests = {
  ...questGeneric,
  ...questMasterclasser,
  ...questPets,
  ...questPotions,
  ...questSeasonal,
  ...questSeries,
  ...questTimeTravel,
  ...questWorld,
};

each(quests, (v, key) => {
  defaults(v, {
    key,
    canBuy () {
      return true;
    },
  });

  const b = v.boss;

  if (b) {
    defaults(b, {
      str: 1,
      def: 1,
    });
    if (b.rage) {
      defaults(b.rage, {
        title: t('rage'),
        description: t('bossRageDescription'),
      });
    }
  }
});

const questsByLevel = sortBy(quests, quest => quest.lvl || 0);

export {
  quests,
  questsByLevel,
  userCanOwnQuestCategories,
};
