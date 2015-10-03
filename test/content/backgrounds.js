import backgroundSets from '../../common/script/src/content/backgrounds';
import {each} from 'lodash';

describe('Backgrounds Locales', () => {
  each(backgroundSets, (set, key) => {
    describe(`${key} Set`, () => {
      each(set, (bg, name) => {
        describe(`${name} Background`, () => {
          it('has a valid text attribute', () => {
            expectValidTranslationString(bg.text);
          });

          it('has a valid notes attribute', () => {
            expectValidTranslationString(bg.notes);
          });
        });
      });
    });
  });
});

