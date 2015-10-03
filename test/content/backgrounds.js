import {
  expectValidTranslationString,
  describeEachItem
} from '../helpers/content.helper';
import {each} from 'lodash';

import backgroundSets from '../../common/script/src/content/backgrounds';

describe('Backgrounds', () => {
  each(backgroundSets, (set, name) => {
    describeEachItem(name, set, (bg, key) => {
      it('has a valid text attribute', () => {
        expectValidTranslationString(bg.text);
      });

      it('has a valid notes attribute', () => {
        expectValidTranslationString(bg.notes);
      });
    });
  });
});

