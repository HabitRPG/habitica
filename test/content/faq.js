import {questions, stillNeedHelp} from '../../common/script/src/content/faq';
import {each} from 'lodash';

describe('FAQ Locales', () => {
  describe('Questions', () => {
    each(questions, (question, index) => {
      describe(`FAQ ${index}`, () => {
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
