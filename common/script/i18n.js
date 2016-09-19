import _ from 'lodash';

let i18n = {
  strings: null,
  translations: {},
  t, // eslint-disable-line no-use-before-define
};

function t (stringName) {
  let vars = arguments[1];
  let locale;

  if (_.isString(arguments[1])) {
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

  let clonedVars = _.clone(vars) || {};

  clonedVars.locale = locale;

  if (string) {
    try {
      return _.template(string)(clonedVars);
    } catch (_error) {
      return 'Error processing the string. Please see Help > Report a Bug.';
    }
  } else {
    let stringNotFound;

    if (i18n.strings) {
      stringNotFound = i18n.strings.stringNotFound;
    } else if (i18n.translations[locale]) {
      stringNotFound = i18n.translations[locale] && i18n.translations[locale].stringNotFound;
    }

    try {
      return _.template(stringNotFound)({
        string: stringName,
      });
    } catch (_error) {
      return 'Error processing the string. Please see Help > Report a Bug.';
    }
  }
}

module.exports = i18n;
