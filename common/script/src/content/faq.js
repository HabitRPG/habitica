import {translator as t} from './helpers';

const NUMBER_OF_QUESTIONS = 12;

let faq = {};

faq.questions = [];

for (var i = 0; i < NUMBER_OF_QUESTIONS; i++) {
  let question = {
    question: t('faqQuestion' + i),
    ios: t('iosFaqAnswer' + i),
    web: t('webFaqAnswer' + i)
  };

  faq.questions.push(question);
}

faq.stillNeedHelp = {
  ios: t('iosFaqStillNeedHelp'),
  web: t('webFaqStillNeedHelp')
};

export default faq;
