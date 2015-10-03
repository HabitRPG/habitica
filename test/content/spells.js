import {
  expectValidTranslationString,
  describeEachItem
} from '../helpers/content.helper';
import {each} from 'lodash';

import spells from '../../common/script/src/content/spells';

describe('Spells', () => {
  each(spells, (spellSet, klass) => {
    describeEachItem(klass, spellSet, (spell, key) => {
      checkSpellAttributes(spell, key);
    });
  });
});

function checkSpellAttributes(spell, key) {
  describe(`${key}`, () => {
    it('has a key attribute', () => {
      expect(spell.key).to.eql(key);
    });

    it('has a valid text attribute', () => {
      expectValidTranslationString(spell.text);
    });

    it('has a valid notes attribute', () => {
      expectValidTranslationString(spell.notes);
    });

    it('has a cast function', () => {
      expect(spell.cast).to.be.a('function');
    });

    it('has a mana attribute', () => {
      expect(spell.mana).to.be.at.least(0);
    });

    it('has a valid target attribute', () => {
      expect(spell.target).to.match(/self|user|party|task/);
    });

    it('has a mana attribute', () => {
      expect(spell.mana).to.be.at.least(0);
    });
  });
}
