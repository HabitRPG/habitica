require('coffee-script');
import i18n from '../../../script/i18n.coffee';

export function translator(string, vars) {
  var func = function(lang) {
    if (vars == null) {
      vars = {
        a: 'a'
      };
    }
    return i18n.t(string, vars, lang);
  };

  func.i18nLangFunc = true; // Trick to recognize this type of function

  return func;
};

