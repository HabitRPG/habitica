import { model as User } from '../../models/user';
import accepts from 'accepts';
import { i18n } from '../../../../common';
import _ from 'lodash';
import {
  translations,
  defaultLangCodes,
  multipleVersionsLanguages,
} from '../../libs/api-v3/i18n';

function _getUniqueListOfLanguages (languages) {
  let acceptableLanguages = _(languages).map((lang) => {
    return lang.slice(0, 2);
  }).uniq().value();

  let uniqueListOfLanguages = _.intersection(acceptableLanguages, defaultLangCodes);

  return uniqueListOfLanguages;
}

function _checkForApplicableLanguageVariant (originalLanguageOptions) {
  let languageVariant = _.find(originalLanguageOptions, (accepted) => {
    let trimmedAccepted = accepted.slice(0, 2);

    return multipleVersionsLanguages[trimmedAccepted];
  });

  return languageVariant;
}

function _getFromBrowser (req) {
  let originalLanguageOptions = accepts(req).languages();
  let uniqueListOfLanguages = _getUniqueListOfLanguages(originalLanguageOptions);
  let baseLanguage = (uniqueListOfLanguages[0] || '').toLowerCase();
  let languageMapping = multipleVersionsLanguages[baseLanguage];

  if (languageMapping) {
    let languageVariant = _checkForApplicableLanguageVariant(originalLanguageOptions);

    if (languageVariant) {
      languageVariant = languageVariant.toLowerCase();
    } else {
      return 'en';
    }

    return languageMapping[languageVariant] || baseLanguage;
  } else {
    return baseLanguage || 'en';
  }
}

function _getFromUser (user, req) {
  let preferredLang = user && user.preferences && user.preferences.language;
  let lang = translations[preferredLang] ? preferredLang : _getFromBrowser(req);

  return lang;
}

function _attachTranslateFunction (req, res, next) {
  res.t = function reqTranslation () {
    return i18n.t(...arguments, req.language);
  };

  next();
}

module.exports = function getUserLanguage (req, res, next) {
  if (req.query.lang) { // In case the language is specified in the request url, use it
    req.language = translations[req.query.lang] ? req.query.lang : 'en';
    return _attachTranslateFunction(...arguments);
  } else if (req.locals && req.locals.user) { // If the request is authenticated, use the user's preferred language
    req.language = _getFromUser(req.locals.user, req);
    return _attachTranslateFunction(...arguments);
  } else if (req.session && req.session.userId) { // Same thing if the user has a valid session
    User.findOne({
      _id: req.session.userId,
    }, 'preferences.language')
    .lean()
    .exec()
    .then((user) => {
      req.language = _getFromUser(user, req);
      return _attachTranslateFunction(...arguments);
    })
    .catch(next);
  } else { // Otherwise get from browser
    req.language = _getFromUser(null, req);
    return _attachTranslateFunction(...arguments);
  }
};
