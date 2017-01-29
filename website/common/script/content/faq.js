import t from './translation';
import nconf from 'nconf';

const NUMBER_OF_QUESTIONS = 12;

let faq = {
  questions: [],
  stillNeedHelp: {
    ios: t('iosFaqStillNeedHelp'),
    web: t('webFaqStillNeedHelp'),
  },
};

for (let i = 0; i <= NUMBER_OF_QUESTIONS; i++) {
  let question = {
    question: t(`faqQuestion${i}`),
    ios: t(`iosFaqAnswer${i}`),
    web: t(`webFaqAnswer${i}`, {
      techAssistanceEmail: nconf.get('EMAILS:TECH_ASSISTANCE_EMAIL'),
      wikiTechAssistanceEmail: `mailto:${nconf.get('EMAILS:TECH_ASSISTANCE_EMAIL')}`,
    }),
  };

  faq.questions.push(question);
}

module.exports = faq;
