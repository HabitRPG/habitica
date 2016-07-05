import {
  translations,
  localePath,
  langCodes,
} from '../../../../../website/server/libs/i18n';
import fs from 'fs';
import path from 'path';

describe('i18n', () => {
  let listOfLocales = [];

  before((done) => {
    fs.readdir(localePath, (err, files) => {
      if (err) return done(err);

      files.forEach((file) => {
        if (fs.statSync(path.join(localePath, file)).isDirectory() === false) return;
        listOfLocales.push(file);
      });

      listOfLocales = listOfLocales.sort();
      done();
    });
  });

  describe('translations', () => {
    it('includes a translation object for each locale', () => {
      listOfLocales.forEach((locale) => {
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
