import { each } from 'lodash';
import {
  expectValidTranslationString,
} from '../helpers/content.helper';

import faq from '../../website/common/script/content/faq';

const { questions, stillNeedHelp } = faq;

describe('FAQ Locales', () => {
  describe('Questions', () => {
    it('has a valid questions', () => {
      each(questions, question => {
        expectValidTranslationString(question.question);
      });
    });

    it('has a valid ios answers', () => {
      each(questions, question => {
        expectValidTranslationString(question.ios);
      });
    });

    it('has a valid web answers', () => {
      each(questions, question => {
        expectValidTranslationString(question.web);
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
