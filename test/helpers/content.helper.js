require('./globals.helper');
import {readdirSync} from 'fs';
import {resolve} from 'path';

import i18n from '../../common/script/src/i18n';
require('coffee-script');
i18n.translations = require('../../website/src/i18n.js').translations;

global.STRING_ERROR_MSG = 'Error processing the string. Please see Help > Report a Bug.';
global.STRING_DOES_NOT_EXIST_MSG = /^String '.*' not found.$/;

global.expectValidTranslationString = (attribute) => {
  expect(attribute).to.be.a('function');

  let translatedString = attribute();

  expect(translatedString).to.not.be.empty;
  expect(translatedString).to.not.eql(STRING_ERROR_MSG);
  expect(translatedString).to.not.match(STRING_DOES_NOT_EXIST_MSG);
};

global.runTestsInDirectory = (directory) => {
  const CONTENT_TEST_PATH = './test/content/';
  let directoryPath = `${CONTENT_TEST_PATH}${directory}`;
  let files = readdirSync(directoryPath);

  files.forEach((file) => {
    let filePath = resolve(`${directoryPath}/${file}`);
    require(filePath);
  });
};
