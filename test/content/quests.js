import {all as allQuests} from '../../common/script/src/content/quests';
import {each} from 'lodash';

describe('Quest Locales', () => {
  each(allQuests, (quest, key) => {
    describe(`${key} Quest`, () => {
      it('has a valid text attribute', () => {
        expectValidTranslationString(quest.text);
      });

      it('has a valid notes attribute', () => {
        expectValidTranslationString(quest.notes);
      });

      if (quest.completion) {
        it('has a valid completion attribute', () => {
          expectValidTranslationString(quest.completion);
        });
      }
    });
  });
});
