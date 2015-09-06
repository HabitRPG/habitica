'use strict';

require('coffee-script');
var t = require('./translation.js');

var NUMBER_OF_QUESTIONS = 12;

var faq = {};

faq.questions = [];

for (var i = 1; i <= NUMBER_OF_QUESTIONS; i++) {
  var question = {
    question: t('faqQuestion' + i),
    ios: t('iosFaqAnswer' + i)
  };

  faq.questions.push(question);
}

faq.stillNeedHelp = {
  ios: t('faqStillNeedHelp')
};

module.exports = faq;
