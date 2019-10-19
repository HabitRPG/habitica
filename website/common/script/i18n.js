import isString from 'lodash/isString';
import clone from 'lodash/clone';
import template from 'lodash/template';

const i18n = {
  strings: null,
  translations: {},
  t, // eslint-disable-line no-use-before-define
};

function t (stringName) {
  const args = Array.from(arguments); // eslint-disable-line prefer-rest-params
  let vars = args[1];
  let locale;

  if (isString(args[1])) {
    vars = null;
    locale = args[1]; // eslint-disable-line prefer-destructuring
  } else if (args[2]) {
    locale = args[2]; // eslint-disable-line prefer-destructuring
  }

  const i18nNotSetup = !i18n.strings && !i18n.translations[locale];

  if (!locale || i18nNotSetup) {
    locale = 'en';
  }

  let string;

  if (i18n.strings) {
    string = i18n.strings[stringName];
  } else {
    string = i18n.translations[locale] && i18n.translations[locale][stringName];
  }

  const clonedVars = clone(vars) || {};

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

export default i18n;
