import {
  translations,
  localePath,
  langCodes,
} from '../../../../../website/src/libs/api-v3/i18n';
import fs from 'fs';
import path from 'path';

describe('i18n', () => {
  describe('translations', () => {
    it('loads all locales', (done) => {
      fs.readdir(localePath, (err, files) => {
        if (err) return done(err);
        let locales = [];

        files.forEach((file) => {
          if (fs.statSync(path.join(localePath, file)).isDirectory() === false) return;
          locales.push(file);
        });

        locales = locales.sort();
        let loaded = Object.keys(translations).sort();

        expect(locales).to.eql(loaded);
        done();
      });
    });

    it('keeps a list all locales', () => {
      expect(Object.keys(translations).sort()).to.eql(langCodes.sort());
    });

    it('has an english translations', () => {
      expect(langCodes).to.contain('en');
      expect(translations.en).to.be.an('object');
    });
  });
});
