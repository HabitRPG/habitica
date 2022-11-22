import t from './translation';

const headings = [
  'overview',
  'set-up-tasks',
  'sample-tasks',
  'task-color',
  'health',
  'party-with-friends',
  'pets-mounts',
  'character-classes',
  'blue-mana-bar',
  'monsters-quests',
  'gems',
  'bugs-features',
  'world-boss',
  'group-plans',
];

const EXCLUDE_ANDROID = [12, 13];
const EXCLUDE_IOS = [12, 13];
const EXCLUDE_WEB = [12];

const faq = {
  questions: [],
  stillNeedHelp: {
    ios: t('iosFaqStillNeedHelp'),
    web: t('webFaqStillNeedHelp'),
  },
};

headings.forEach((heading, index) => {
  const question = {
    heading,
    question: t(`faqQuestion${index}`),
    android: EXCLUDE_ANDROID.indexOf(index) === -1 ? t(`androidFaqAnswer${index}`) : null,
    ios: EXCLUDE_IOS.indexOf(index) === -1 ? t(`iosFaqAnswer${index}`) : null,
    web: EXCLUDE_WEB.indexOf(index) === -1 ? t(`webFaqAnswer${index}`, {
      //  TODO: Need to pull these values from nconf
      techAssistanceEmail: 'admin@habitica.com',
      wikiTechAssistanceEmail: 'mailto:admin@habitica.com',
    }) : null,
  };

  faq.questions.push(question);
});

export default faq;
