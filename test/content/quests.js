import {
  expectValidTranslationString,
  describeEachItem
} from '../helpers/content.helper';
import {each} from 'lodash';

import {
  all as allQuests,
  byLevel as questsByLevel
} from '../../common/script/src/content/quests';

describeEachItem('Quests', allQuests, (quest, key) => {
  context('attributes', () => {
    it('has a key', () => {
      expect(quest.key).to.eql(key);
    });

    it('has a category', () => {
      expect(quest.category).to.not.be.empty;
    });

    it('has a valid text attribute', () => {
      expectValidTranslationString(quest.text);
    });

    it('has a valid notes attribute', () => {
      expectValidTranslationString(quest.notes);
    });

    if (quest.previous) {
      it('has a valid previous quest', () => {
        expect(allQuests[quest.previous]).to.exist;
      });
    }

    if (quest.completion) {
      it('has a valid completion attribute', () => {
        expectValidTranslationString(quest.completion);
      });
    }

    it('has a canBuy function', () => {
      expect(quest.canBuy).to.be.a('function');
    });

    it('has a value', () => {
      expect(quest.value).to.be.at.least(0);
    });
  });

  if (quest.boss) {
    context('boss', () => {
      it('has a valid boss name attribute', () => {
        expectValidTranslationString(quest.boss.name);
      });

      it('has an hp attribute', () => {
        expect(quest.boss.hp).to.be.greaterThan(0);
      });

      it('has a str attribute', () => {
        expect(quest.boss.str).to.be.greaterThan(0);
      });

      it('has a def attribute', () => {
        expect(quest.boss.def).to.be.greaterThan(0);
      });

      if (quest.boss.rage) {
        context('rage', () => {
          it('has a title attribute', () => {
            expectValidTranslationString(quest.boss.rage.title);
          });

          it('has a description attribute', () => {
            expectValidTranslationString(quest.boss.rage.description);
          });

          it('has a value attribute', () => {
            expect(quest.boss.rage.value).to.be.greaterThan(0);
          });

          if (quest.boss.rage.healing) {
            it('has a healing attribute', () => {
              expect(quest.boss.rage.healing).to.be.greaterThan(0);
            });
          }

          if (quest.boss.rage.effect) {
            it('has an effect attribute', () => {
              expectValidTranslationString(quest.boss.rage.effect);
            });
          }
        });
      }
    });
  }

  if (quest.collect) {
    context('collection', () => {
      each(quest.collect, (item, key) => {
        it(`${key} has a valid text attribute`, () => {
          expectValidTranslationString(item.text);
          expect(item.count).to.be.greaterThan(0);
        });
      });
    });
  }

  context('drops', () => {
    it('has drops', () => {
      expect(quest.drop).to.exist;
    });

    it('has a gold value', () => {
      expect(quest.drop.gp).to.be.at.least(0);
    });

    it('has a exp value', () => {
      expect(quest.drop.exp).to.be.at.least(0);
    });

    if (quest.items) {
      it('has items', () => {
        expect(quest.drop.items).to.be.an('array');
        expect(quest.drop.items).to.have.length.above(0);
      });
    }
  });
});

describe('Quests by Level', () => {
  let lastLevel = 0;

  it('orders quests by level', () => {
    each(questsByLevel, (quest, key) => {
      let questLvl = quest.lvl || 0;

      expect(questLvl).to.be.at.least(lastLevel);
      lastLevel = questLvl;
    });

    expect(lastLevel).to.be.greaterThan(0);
  });
});
