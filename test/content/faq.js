import {
  expectValidTranslationString,
  describeEachItem
} from '../helpers/content.helper';

import {questions, stillNeedHelp} from '../../common/script/src/content/faq';

describe('FAQ Locales', () => {
  describeEachItem('Questions', questions, (question, index) => {
    it('has a valid question', () => {
      expectValidTranslationString(question.question);
    });

    it('has a valid ios answer', () => {
      expectValidTranslationString(question.ios);
    });

    it('has a valid web answer', () => {
      expectValidTranslationString(question.web);
    });
  });

  describe('Still Need Help Message', () => {
    it('has a valid ios message', () => {
      expectValidTranslationString(stillNeedHelp.ios);
    });

    it('has a valid web message', () => {
      expectValidTranslationString(stillNeedHelp.web);
    });
  });
});
