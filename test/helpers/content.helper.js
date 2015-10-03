require('./globals.helper');
import {each} from 'lodash';

import i18n from '../../common/script/src/i18n';
require('coffee-script');
i18n.translations = require('../../website/src/i18n.js').translations;

export const STRING_ERROR_MSG = 'Error processing the string. Please see Help > Report a Bug.';
export const STRING_DOES_NOT_EXIST_MSG = /^String '.*' not found.$/;

export function expectValidTranslationString (attribute) {
  expect(attribute).to.be.a('function');

  let translatedString = attribute();

  expect(translatedString).to.not.be.empty;
  expect(translatedString).to.not.eql(STRING_ERROR_MSG);
  expect(translatedString).to.not.match(STRING_DOES_NOT_EXIST_MSG);
};

export function describeEachItem (testDescription, set, cb, describeFunction) {
  // describeFunction allows you to pass in 'only' or 'skip'
  // as the last argument for writing/debugging tests.
  // This should only be used with the helper functions .only and .skip below
  let describeBlock = describe[describeFunction] || describe;

  describeBlock(testDescription, () => {
    each(set, (item, key) => {
      describe(key, () => {
        cb(item, key);
      });
    });
  });
}

describeEachItem.only = (des, set, cb) => {
  describeEachItem(des, set, cb, 'only');
}

describeEachItem.skip = (des, set, cb) => {
  describeEachItem(des, set, cb, 'skip');
}
