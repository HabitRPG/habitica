import t from './translation';

const questionList = [
  {
    heading: 'overview',
    translationIndex: 0,
  },
  {
    heading: 'set-up-tasks',
    translationIndex: 1,
  },
  {
    heading: 'sample-tasks',
    translationIndex: 2,
  },
  {
    heading: 'task-color',
    translationIndex: 3,
  },
  {
    heading: 'health',
    translationIndex: 4,
  },
  {
    heading: 'pets-mounts',
    translationIndex: 6,
  },
  {
    heading: 'character-classes',
    translationIndex: 7,
  },
  {
    heading: 'blue-mana-bar',
    translationIndex: 8,
  },
  {
    heading: 'monsters-quests',
    translationIndex: 9,
  },
  {
    heading: 'gems',
    translationIndex: 10,
  },
  {
    heading: 'bugs-features',
    translationIndex: 11,
  },
  {
    heading: 'group-plans',
    translationIndex: 13,
  },
  {
    heading: 'party-with-friends',
    translationIndex: 5,
  },
  {
    heading: 'party-detail-1',
    translationIndex: 14,
  },
  {
    heading: 'party-detail-2',
    translationIndex: 15,
  },
  {
    heading: 'party-detail-3',
    translationIndex: 16,
  },
  {
    heading: 'party-detail-4',
    translationIndex: 17,
  },
  {
    heading: 'party-detail-5',
    translationIndex: 18,
  },
  {
    heading: 'party-detail-6',
    translationIndex: 19,
  },
  {
    heading: 'party-detail-7',
    translationIndex: 20,
  },
  {
    heading: 'party-detail-8',
    translationIndex: 21,
  },
  {
    heading: 'party-detail-9',
    translationIndex: 22,
  },
  {
    heading: 'party-detail-10',
    translationIndex: 23,
  },
  {
    heading: 'party-detail-11',
    translationIndex: 24,
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
