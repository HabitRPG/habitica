import isString from 'lodash/isString';
import clone from 'lodash/clone';
import template from 'lodash/template';

let i18n = {
  strings: null,
  translations: {},
  t, // eslint-disable-line no-use-before-define
};

function t (stringName) {
  let vars = arguments[1];
  let locale;

  if (isString(arguments[1])) {
    vars = null;
    locale = arguments[1];
  } else if (arguments[2]) {
    locale = arguments[2];
  }

  let i18nNotSetup = !i18n.strings && !i18n.translations[locale];

  if (!locale || i18nNotSetup) {
    locale = 'en';
  }

  let string;

  if (i18n.strings) {
    string = i18n.strings[stringName];
  } else {
    string = i18n.translations[locale] && i18n.translations[locale][stringName];
  }

  let clonedVars = clone(vars) || {};

  clonedVars.locale = locale;

  if (string) {
    try {
      return template(string)(clonedVars);
    } catch (_error) {
      return `Error processing the string "${stringName}". Please see Help > Report a Bug.`;
    }
  } else {
    let stringNotFound;

    if (i18n.strings) {
      stringNotFound = i18n.strings.stringNotFound;
    } else if (i18n.translations[locale]) {
      stringNotFound = i18n.translations[locale] && i18n.translations[locale].stringNotFound;
    }

    try {
      return template(stringNotFound)({
        string: stringName,
      });
    } catch (_error) {
      return 'Error processing the string "stringNotFound". Please see Help > Report a Bug.';
    }
  }
}

module.exports = i18n;
