import t from './translation';

const NUMBER_OF_QUESTIONS = 12;

const faq = {
  questions: [],
  stillNeedHelp: {
    ios: t('iosFaqStillNeedHelp'),
    web: t('webFaqStillNeedHelp'),
  },
};

for (let i = 0; i <= NUMBER_OF_QUESTIONS; i += 1) {
  const question = {
    question: t(`faqQuestion${i}`),
    ios: t(`iosFaqAnswer${i}`),
    android: t(`androidFaqAnswer${i}`),
    web: t(`webFaqAnswer${i}`, {
      //  TODO: Need to pull these values from nconf
      techAssistanceEmail: 'admin@habitica.com',
      wikiTechAssistanceEmail: 'mailto:admin@habitica.com',
    }),
  };

  faq.questions.push(question);
}

export default faq;
