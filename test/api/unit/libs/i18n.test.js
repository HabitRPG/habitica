import {
  translations,
  langCodes,
  approvedLanguages,
} from '../../../../website/server/libs/i18n';

describe('i18n', () => {
  const listOfLocales = approvedLanguages.sort();

  describe('translations', () => {
    it('includes a translation object for each locale', () => {
      listOfLocales.forEach(locale => {
        expect(translations[locale]).to.be.an('object');
      });
    });
  });

  describe('langCodes', () => {
    it('is a list of all the language codes', () => {
      expect(langCodes.sort()).to.eql(listOfLocales);
    });
  });
});
