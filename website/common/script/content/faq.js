import forEach from 'lodash/forEach';
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

const exclusions = {
  android: [12, 13],
  ios: [12, 13],
  web: [12],
};

const faq = {
  questions: [],
  stillNeedHelp: {
    ios: t('iosFaqStillNeedHelp'),
    web: t('webFaqStillNeedHelp'),
  },
};

headings.forEach((heading, index) => {
  const question = {
    exclusions: [],
    heading,
    question: t(`faqQuestion${index}`),
    android: t(`androidFaqAnswer${index}`),
    ios: t(`iosFaqAnswer${index}`),
    web: t(`webFaqAnswer${index}`, {
      //  TODO: Need to pull these values from nconf
      techAssistanceEmail: 'admin@habitica.com',
      wikiTechAssistanceEmail: 'mailto:admin@habitica.com',
    }),
  };

  forEach(exclusions, (platform, key) => {
    if (platform.indexOf(index) !== -1) {
      question.exclusions.push(key);
    }
  });

  faq.questions.push(question);
});

export default faq;
