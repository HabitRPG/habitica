import i18n from '../../website/common/script/i18n';
import './globals.helper';
import { translations } from '../../website/server/libs/i18n';

i18n.translations = translations;

export const STRING_ERROR_MSG = /^Error processing the string ".*". Please see Help > Report a Bug.$/;
export const STRING_DOES_NOT_EXIST_MSG = /^String '.*' not found.$/;

export function expectValidTranslationString (attribute) {
  expect(attribute).to.be.a('function');

  const translatedString = attribute();

  expect(translatedString.trim()).to.not.be.empty;
  expect(translatedString).to.not.contain('function func(lang)');
  expect(translatedString).to.not.eql(STRING_ERROR_MSG);
  expect(translatedString).to.not.match(STRING_DOES_NOT_EXIST_MSG);
}
