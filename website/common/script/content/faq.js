import t from './translation';

let faqFunction = function(replacements)
{
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
        //TODO: Need to pull these values from nconf
        techAssistanceEmail: 'techassistance@habitica.com', 
        wikiTechAssistanceEmail: 'mailto:techassistance@habitica.com',
      }),
    };

    faq.questions.push(question);
  }
}

module.exports = faqFunction;
