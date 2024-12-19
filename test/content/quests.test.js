import {
  each,
} from 'lodash';
import {
  expectValidTranslationString,
} from '../helpers/content.helper';

import { quests } from '../../website/common/script/content/quests';

describe('quests', () => {
  let clock;

  afterEach(() => {
    if (clock) {
      clock.restore();
    }
  });

  it('contains basic information about each quest', () => {
    each(quests, (quest, key) => {
      expectValidTranslationString(quest.text);
      expectValidTranslationString(quest.notes);
      expectValidTranslationString(quest.completion);
      expect(quest.key, key).to.equal(key);
      expect(quest.category, key).to.be.a('string');
      if (quest.boss) {
        expectValidTranslationString(quest.boss.name);
        expect(quest.boss.hp, key).to.be.a('number');
        expect(quest.boss.str, key).to.be.a('number');
      }
      expect(quest.drop).to.be.an('object');
      expect(quest.drop.gp, key).to.be.a('number');
      expect(quest.drop.exp, key).to.be.a('number');
      if (quest.drop.items) {
        quest.drop.items.forEach(drop => {
          expectValidTranslationString(drop.text);
          expect(drop.type, key).to.exist;
        });
      }
    });
  });
});
