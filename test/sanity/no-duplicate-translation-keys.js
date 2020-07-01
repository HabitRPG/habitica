import { sync as glob } from 'glob';

describe('Locales files', () => {
  it('do not contain duplicates of any keys', () => {
    const translationFiles = glob('./website/common/locales/en/*.json');

    if (translationFiles.length === 0) {
      throw new Error('Could not find any files in ./website/common/locales/en/*.json');
    }

    const keys = {};

    translationFiles.forEach(file => {
      const json = require(`../.${file}`); // eslint-disable-line global-require, import/no-dynamic-require

      Object.keys(json).forEach(key => {
        if (keys[key]) {
          throw new Error(`${key} in ${file} already exists in ${keys[key]}.`);
        }

        keys[key] = file;
      });
    });
  });
});
