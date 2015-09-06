'use strict';

require('coffee-script');

var t = require('./translation.js');

var faq = {};

faq.questions = [];

for (var i = 1; i <= 12; i++) {
  var question = {
    question: t('mobileFaqQuestion' + i),
    ios: t('iosFaqAnswer' + i)
  };

  faq.questions.push(question);
}

faq.stillNeedHelp = {
  ios: t('iosStillNeedHelp')
};

module.exports = faq;
