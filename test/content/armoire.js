import {
  expectValidTranslationString
} from '../helpers/content.helper';

import armoire from '../../common/script/src/content/armoire';

describe('Armoire Locales', () => {
  it('has a valid text attribute', () => {
    expectValidTranslationString(armoire.text);
  });
});
