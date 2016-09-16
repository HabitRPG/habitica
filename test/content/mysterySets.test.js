import {each} from 'lodash';
import {
  expectValidTranslationString
} from '../helpers/content.helper';

import mysterySets from '../../website/common/script/content/mystery-sets';

describe('Mystery Sets', () => {
  it('has a valid text string', () => {
    each(mysterySets, (set, key) => {
      expectValidTranslationString(set.text);
    });
  });
});
