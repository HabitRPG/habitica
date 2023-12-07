import t from './translation';

const questionList = [
  {
    heading: 'task-types',
    translationIndex: 25,
  },
  {
    heading: 'sample-tasks',
    translationIndex: 26,
  },
  {
    heading: 'task-color',
    translationIndex: 27,
  },
  {
    heading: 'pause-dailies',
    translationIndex: 28,
  },
  {
    heading: 'recover-hp',
    translationIndex: 29,
  },
  {
    heading: 'no-hp',
    translationIndex: 30,
  },
  {
    heading: 'lose-hp',
    translationIndex: 31,
  },
  {
    heading: 'choose-class',
    translationIndex: 32,
  },
  {
    heading: 'blue-bar',
    translationIndex: 33,
  },
  {
    heading: 'pet-foods',
    translationIndex: 34,
  },
  {
    heading: 'pets-mounts',
    translationIndex: 35,
  },
  {
    heading: 'avatar-appearance',
    translationIndex: 36,
  },
  {
    heading: 'equipment-display',
    translationIndex: 37,
  },
  {
    heading: 'cant-purchase',
    translationIndex: 38,
  },
  {
    heading: 'more-eqipment',
    translationIndex: 39,
  },
  {
    heading: 'gems',
    translationIndex: 40,
  },
  {
    heading: 'hourglasses',
    translationIndex: 41,
  },
  {
    heading: 'increase-accountability',
    translationIndex: 42,
  },
  {
    heading: 'quests',
    translationIndex: 43,
  },
  {
    heading: 'delete-challenge-tasks',
    translationIndex: 44,
  },
  {
    heading: 'avatar-transform',
    translationIndex: 45,
  },
  {
    heading: 'report-a-bug',
    translationIndex: 46,
  },
  {
    heading: 'data',
    translationIndex: 47,
  },
  {
    heading: 'play-with-others',
    translationIndex: 48,
  },
  {
    heading: 'find-a-party',
    translationIndex: 49,
  },
  {
    heading: 'search-for-party',
    translationIndex: 50,
  },
  {
    heading: 'search-length',
    translationIndex: 51,
  },
  {
    heading: 'stop-search',
    translationIndex: 52,
  },
  {
    heading: 'find-members',
    translationIndex: 53,
  },
  {
    heading: 'how-many-members',
    translationIndex: 54,
  },
  {
    heading: 'invite-someone',
    translationIndex: 55,
  },
  {
    heading: 'cancel-invitation',
    translationIndex: 56,
  },
  {
    heading: 'unwanted-invitations',
    translationIndex: 57,
  },
  {
    heading: 'filter-list',
    translationIndex: 58,
  },
  {
    heading: 'what-is-group-plan',
    translationIndex: 59,
  },
  {
    heading: 'group-plan-get-started',
    translationIndex: 60,
  },
  {
    heading: 'group-create-tasks',
    translationIndex: 61,
  },
  {
    heading: 'group-assigned-tasks',
    translationIndex: 62,
  },
  {
    heading: 'group-unassigned-tasks',
    translationIndex: 63,
  },
  {
    heading: 'group-day-reset',
    translationIndex: 64,
  },
  {
    heading: 'group-plan-mobile',
    translationIndex: 65,
  },
  {
    heading: 'group-shared-vs-challenge',
    translationIndex: 66,
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
    web: t(`webFaqAnswer${listEntry.translationIndex}`, {
      //  TODO: Need to pull these values from nconf
      techAssistanceEmail: 'admin@habitica.com',
      wikiTechAssistanceEmail: 'mailto:admin@habitica.com',
    }),
  };

  faq.questions.push(question);
});

export default faq;
