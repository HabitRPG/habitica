let _ = require('lodash');

module.exports = {
  strings: null,
  translations: {},
  t: function(stringName) {
    var clonedVars, e, locale, string, stringNotFound, vars;
    vars = arguments[1];
    if (_.isString(arguments[1])) {
      vars = null;
      locale = arguments[1];
    } else if (arguments[2] != null) {
      vars = arguments[1];
      locale = arguments[2];
    }
    if ((locale == null) || (!module.exports.strings && !module.exports.translations[locale])) {
      locale = 'en';
    }
    if (module.exports.strings) {
      string = module.exports.strings[stringName];
    } else {
      string = module.exports.translations[locale] && module.exports.translations[locale][stringName];
    }
    clonedVars = _.clone(vars) || {};
    clonedVars.locale = locale;
    if (string) {
      try {
        return _.template(string, clonedVars);
      } catch (_error) {
        e = _error;
        return 'Error processing the string. Please see Help > Report a Bug.';
      }
    } else {
      if (module.exports.strings) {
        stringNotFound = module.exports.strings.stringNotFound;
      } else if (module.exports.translations[locale]) {
        stringNotFound = module.exports.translations[locale] && module.exports.translations[locale].stringNotFound;
      }
      try {
        return _.template(stringNotFound, {
          string: stringName
        });
      } catch (_error) {
        e = _error;
        return 'Error processing the string. Please see Help > Report a Bug.';
      }
    }
  }
};
