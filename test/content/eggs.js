import {
  expectValidTranslationString
} from '../helpers/content.helper';

import {allEggs} from '../../common/script/src/content/eggs';
import {each} from 'lodash';

describe('Egg Locales', () => {
  each(allEggs, (egg, key) => {
    describe(`${key} Egg`, () => {
      it('has a valid text attribute', () => {
        expectValidTranslationString(egg.text);
      });

      it('has a valid notes attribute', () => {
        expectValidTranslationString(egg.notes);
      });

      it('has a valid ajective attribute', () => {
        expectValidTranslationString(egg.adjective);
      });
    });
  });
});

