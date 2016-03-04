import t from './translation';

const NUMBER_OF_QUESTIONS = 12;

export const questions = [];

for (let i = 0; i <= NUMBER_OF_QUESTIONS; i++) {
  let question = {
    question: t(`faqQuestion${i}`),
    ios: t(`iosFaqAnswer${i}`),
    web: t(`webFaqAnswer${i}`),
  };

  questions.push(question);
}

export const stillNeedHelp = {
  ios: t('iosFaqStillNeedHelp'),
  web: t('webFaqStillNeedHelp'),
};
