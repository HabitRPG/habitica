import {
  expectValidTranslationString
} from '../helpers/content.helper';

import healthPotion from '../../common/script/src/content/health-potion';

describe('Health Potion Locales', () => {
  it('has a valid text attribute', () => {
    expectValidTranslationString(healthPotion.text);
  });

  it('has a valid notes attribute', () => {
    expectValidTranslationString(healthPotion.notes);
  });
});

