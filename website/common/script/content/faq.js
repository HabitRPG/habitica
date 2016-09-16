import t from './translation';

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
    web: t(`webFaqAnswer${i}`),
  };

  faq.questions.push(question);
}

module.exports = faq;
