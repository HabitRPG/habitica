import t from './translation';

const questionList = [
  {
    heading: 'task-types',
    translationIndex: 0,
  },
  {
    heading: 'sample-tasks',
    translationIndex: 1,
  },
  {
    heading: 'task-color',
    translationIndex: 2,
  },
  {
    heading: 'pause-dailies',
    translationIndex: 3,
  },
  {
    heading: 'recover-hp',
    translationIndex: 4,
  },
  {
    heading: 'no-hp',
    translationIndex: 5,
  },
  {
    heading: 'lose-hp',
    translationIndex: 6,
  },
  {
    heading: 'choose-class',
    translationIndex: 7,
  },
  {
    heading: 'blue-bar',
    translationIndex: 8,
  },
  {
    heading: 'pet-foods',
    translationIndex: 9,
  },
  {
    heading: 'pets-mounts',
    translationIndex: 10,
  },
  {
    heading: 'avatar-appearance',
    translationIndex: 11,
  },
  {
    heading: 'equipment-display',
    translationIndex: 12,
  },
  {
    heading: 'cant-purchase',
    translationIndex: 13,
  },
  {
    heading: 'more-eqipment',
    translationIndex: 14,
  },
  {
    heading: 'gems',
    translationIndex: 15,
  },
  {
    heading: 'hourglasses',
    translationIndex: 16,
  },
  {
    heading: 'increase-accountability',
    translationIndex: 17,
  },
  {
    heading: 'quests',
    translationIndex: 18,
  },
  {
    heading: 'delete-challenge-tasks',
    translationIndex: 19,
  },
  {
    heading: 'avatar-transform',
    translationIndex: 20,
  },
  {
    heading: 'report-a-bug',
    translationIndex: 21,
  },
  {
    heading: 'data',
    translationIndex: 22,
  },
  {
    heading: 'play-with-others',
    translationIndex: 23,
  },
  {
    heading: 'find-a-party',
    translationIndex: 24,
  },
  {
    heading: 'search-party',
    translationIndex: 25,
  },
  {
    heading: 'search-length',
    translationIndex: 26,
  },
  {
    heading: 'stop-search',
    translationIndex: 27,
  },
  {
    heading: 'find-members',
    translationIndex: 28,
  },
  {
    heading: 'how-many-members',
    translationIndex: 29,
  },
  {
    heading: 'invite-someone',
    translationIndex: 30,
  },
  {
    heading: 'cancel-invitation',
    translationIndex: 31,
  },
  {
    heading: 'unwanted-invitations',
    translationIndex: 32,
  },
  {
    heading: 'filter-list',
    translationIndex: 33,
  },
  {
    heading: 'what-is-group-plan',
    translationIndex: 34,
  },
  {
    heading: 'group-create-tasks',
    translationIndex: 35,
  },
  {
    heading: 'group-assigned-tasks',
    translationIndex: 36,
  },
  {
    heading: 'group-unassigned-tasks',
    translationIndex: 37,
  },
  {
    heading: 'group-day-reset',
    translationIndex: 38,
  },
  {
    heading: 'group-plan-mobile',
    translationIndex: 39,
  },
  {
    heading: 'group-shared-vs-challenge',
    translationIndex: 40,
  },
];

const faq = {
  questions: [],
  stillNeedHelp: {
    ios: t('iosFaqStillNeedHelp'),
    web: t('webFaqStillNeedHelp'),
  },
};

questionList.forEach(listEntry => {
  const question = {
    exclusions: listEntry.excludedPlatforms || [],
    heading: listEntry.heading,
    question: t(`faqQuestion${listEntry.translationIndex}`),
    android: t(`androidFaqAnswer${listEntry.translationIndex}`),
    ios: t(`iosFaqAnswer${listEntry.translationIndex}`),
    web: t(`webFaqAnswer${listEntry.translationIndex}`, {
      //  TODO: Need to pull these values from nconf
      techAssistanceEmail: 'admin@habitica.com',
      wikiTechAssistanceEmail: 'mailto:admin@habitica.com',
    }),
  };

  faq.questions.push(question);
});

export default faq;
