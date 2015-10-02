import userDefaults from '../../common/script/src/content/user-defaults';
import {each} from 'lodash';

describe('User Default Locales', () => {
  each(userDefaults, (types, key) => {
    describe(`${key}`, () => {
      each(types, (type, index) => {
        describe(`${key}[${index}]`, () => {
          if (type.text) {
            it('has a valid text attribute', () => {
              expectValidTranslationString(type.text);
            });
          }

          if (type.name) {
            it('has a valid name attribute', () => {
              expectValidTranslationString(type.name);
            });
          }

          if (type.notes) {
            it('has a valid notes attribute', () => {
              expectValidTranslationString(type.notes);
            });
          }
        });
      });
    });
  });
});
