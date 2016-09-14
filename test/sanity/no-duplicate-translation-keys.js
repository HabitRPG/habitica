'use strict';

let glob = require('glob').sync;

describe('Locales files', () => {
  it('do not contain duplicates of any keys', () => {
    let translationFiles = glob('./website/common/locales/en/*.json');

    if (translationFiles.length === 0) {
      throw new Error('Could not find any files in ./website/common/locales/en/*.json');
    }

    let keys = {};

    translationFiles.forEach((file) => {
      let json = require(`../.${file}`); // eslint-disable-line global-require

      Object.keys(json).forEach((key) => {
        if (keys[key]) {
          throw new Error(`${key} in ${file} already exists in ${keys[key]}.`);
        }

        keys[key] = file;
      });
    });
  });
});
