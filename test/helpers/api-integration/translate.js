import i18n from '../../../common/script/i18n';
i18n.translations = require('../../../website/src/libs/api-v3/i18n').translations;

// Use this to verify error messages returned by the server
// That way, if the translated string changes, the test
// will not break. NOTE: it checks against errors with string as well.
export function translate (key, variables) {
  const STRING_ERROR_MSG = 'Error processing the string. Please see Help > Report a Bug.';
  const STRING_DOES_NOT_EXIST_MSG = /^String '.*' not found.$/;

  let translatedString = i18n.t(key, variables);

  expect(translatedString).to.not.be.empty;
  expect(translatedString).to.not.eql(STRING_ERROR_MSG);
  expect(translatedString).to.not.match(STRING_DOES_NOT_EXIST_MSG);

  return translatedString;
}
