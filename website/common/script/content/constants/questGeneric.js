import t from '../translation';

const QUEST_GENERIC = {
  basilist: {
    text: t('questBasilistText'),
    notes: t('questBasilistNotes'),
    group: 'questGroupEarnable',
    completion: t('questBasilistCompletion'),
    goldValue: 100,
    category: 'unlockable',
    unlockCondition: {
      condition: 'party invite',
      text: t('inviteFriends'),
    },
    boss: {
      name: t('questBasilistBoss'),
      hp: 100,
      str: 0.5,
    },
    drop: {
      gp: 8,
      exp: 42,
    },
  },
  dustbunnies: {
    text: t('questDustBunniesText'),
    notes: t('questDustBunniesNotes'),
    group: 'questGroupEarnable',
    completion: t('questDustBunniesCompletion'),
    value: 1,
    category: 'unlockable',
    boss: {
      name: t('questDustBunniesBoss'),
      hp: 100,
      str: 0.5,
    },
    drop: {
      gp: 8,
      exp: 42,
    },
  },
};

export default QUEST_GENERIC;
