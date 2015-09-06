'use strict';

require('coffee-script');

var t = require('./translation.coffee');

var faq = {};

faq.questions = [
  {
    question: t('mobileFaqQuestion1'),
    ios: t('iosFaqAnswer1')
  },
  {
    question: t('mobileFaqQuestion2'),
    ios: t('iosFaqAnswer2')
  },
  {
    question: t('mobileFaqQuestion3'),
    ios: t('iosFaqAnswer3')
  },
  {
    question: t('mobileFaqQuestion4'),
    ios: t('iosFaqAnswer4')
  },
  {
    question: t('mobileFaqQuestion5'),
    ios: t('iosFaqAnswer5')
  },
  {
    question: t('mobileFaqQuestion6'),
    ios: t('iosFaqAnswer6')
  },
  {
    question: t('mobileFaqQuestion7'),
    ios: t('iosFaqAnswer7')
  },
  {
    question: t('mobileFaqQuestion8'),
    ios: t('iosFaqAnswer8')
  },
  {
    question: t('mobileFaqQuestion9'),
    ios: t('iosFaqAnswer9')
  },
  {
    question: t('mobileFaqQuestion10'),
    ios: t('iosFaqAnswer10')
  },
  {
    question: t('mobileFaqQuestion11'),
    ios: t('iosFaqAnswer11')
  },
  {
    question: t('mobileFaqQuestion12'),
    ios: t('iosFaqAnswer12')
  }
];

faq.stillNeedHelp = {
  ios: t('iosStillNeedHelp')
};

module.exports = faq;
