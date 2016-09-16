import i18n from '../i18n';

module.exports = function translator (string, vars = { a: 'a' }) {
  function func (lang) {
    return i18n.t(string, vars, lang);
  }

  func.i18nLangFunc = true; // Trick to recognize this type of function

  return func;
};
