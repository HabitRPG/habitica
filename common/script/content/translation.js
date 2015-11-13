'use strict';

var i18n = require('../i18n');

var t = function(string, vars) {
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

module.exports = t;
